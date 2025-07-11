import { spawn } from "child_process";
import fs from "fs";
import axios from "axios";
import https from "https";
import cloudinaryModule from "cloudinary";
import streamifier from "streamifier";
import dotenv from "dotenv";
dotenv.config()

const cloudinary = cloudinaryModule.v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

const saveToCloud = async (req, res) => {
    const { audioUrl, coverUrl, id, title, artist, duration } = req.body;

    let songPublicUrl = null;
    let coverPublicUrl = null;

    const uploadImageFromUrl = async url => {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await axios({
                    method: "get",
                    url,
                    responseType: "stream",
                    timeout: 60000, // 10 seconds
                    headers: {
                        "User-Agent": "Mozilla/5.0"
                    }
                });

                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        resource_type: "image",
                        folder: "covers/"
                    },
                    (error, result) => {
                        if (error) return reject(error);
                        resolve(result.secure_url);
                    }
                );

                response.data.pipe(uploadStream);
            } catch (err) {
                reject(err);
            }
        });
    };

    const uploadAudioFromUrl = async url => {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await axios({
                    method: "get",
                    url,
                    responseType: "stream",
                    timeout: 60000, // 20 seconds
                    headers: {
                        "User-Agent": "Mozilla/5.0"
                    }
                });

                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        resource_type: "video",
                        folder: "songs/"
                    },
                    (error, result) => {
                        if (error) return reject(error);
                        resolve(result.secure_url);
                    }
                );

                response.data.pipe(uploadStream);
            } catch (err) {
                reject(err);
            }
        });
    };

    try {
        const isExistsRes = await axios.post(
            "https://vivid-music.vercel.app/checkSongExistsByYtId",
            { id }
        );

        if (isExistsRes.data.exists) {
            return res
                .status(409)
                .json({ message: "song already exists ", title });
        }
        
        console.log('\n\nUoloading...\n')

        coverPublicUrl = await uploadImageFromUrl(coverUrl);
        songPublicUrl = await uploadAudioFromUrl(audioUrl);

        console.log(title, songPublicUrl, id);

        if (!title || !songPublicUrl || !id)
            return res.status(400).json({
                success: false,
                message: "some values missing",
                title
            });

        const response = await axios.post(
            "https://vivid-music.vercel.app/addSong",
            {
                title,
                songURL: songPublicUrl,
                coverURL: coverPublicUrl,
                id,
                artist,
                duration
            }
        );

        if (response.status === 200 && response.data.success)
            return res.status(200).json({
                success: true,
                message: "uploaded successfully",
                title
            });
        else
            return res.status(410).json({
                success: false,
                message: "unexpected error",
                title
                
            });
    } catch (err) {
        console.error("❌ Upload failed:", err);
        return res.status(500).json({
            success: false,
            message: "Upload failed",
            title,
            error: err.toString()
        });
    }
};

export default saveToCloud;
