import { spawn } from "child_process";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import https from "https";
import sanitizeUrl from "../utils/sanitizeUrl.js";
import dotenv from "dotenv"

dotenv.config()

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const saveToCloudinary = async (req, res) => {
    let { url, audioFormat } = req.body;

    url = sanitizeUrl(url);
    if (!url) return res.status(400).json({ error: "Missing YouTube URL" });

    console.log("\n============================================================");
    console.log("🚀 STARTING UPLOAD PROCESS");
    console.log("============================================================");

    try {
        // First get video info
        const ytdlpInfo = spawn("yt-dlp", [
            "--dump-json",
            "--no-warnings",
            "--cookies",
            "./cookies.txt",
            "--geo-bypass",
            "--geo-bypass-country=US",
            url
        ]);

        let infoJson = "";
        ytdlpInfo.stdout.on("data", data => {
            infoJson += data.toString();
        });

        await new Promise((resolve, reject) => {
            ytdlpInfo.on("close", code => {
                if (code === 0) resolve();
                else reject(new Error(`yt-dlp info failed with code ${code}`));
            });
        });

        const metadata = JSON.parse(infoJson);
        const title = metadata.title;
        const id = metadata.id;
        const artist = metadata.artist || "unknown";
        const duration = metadata.duration;
        const thumbnail = metadata.thumbnail;

        console.log(`📝 Title: ${title}`);
        console.log(`⏱️ Duration: ${duration}s`);
        console.log("============================================================\n");

        // Create temporary directory
        const tempDir = `/tmp/${id}`;
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        const audioFile = path.join(tempDir, `${id}.webm`);
        const coverFile = path.join(tempDir, `${id}.webp`);

        // Start both downloads simultaneously
        const audioPromise = new Promise((resolve, reject) => {
            console.log("🎵 Downloading audio file... ");

            const ytdlpAudio = spawn("yt-dlp", [
                "-f", audioFormat || "bestaudio",
                "--extract-audio",
                "--audio-format", "webm",
                "--cookies", "./cookies.txt",
                "--geo-bypass",
                "--geo-bypass-country=US",
                "-o", audioFile,
                url
            ]);

            ytdlpAudio.on("close", code => {
                if (code === 0 && fs.existsSync(audioFile)) {
                    resolve();
                } else {
                    reject(new Error(`Audio download failed with code ${code}`));
                }
            });
        });

        const coverPromise = new Promise((resolve, reject) => {
            console.log("📷 Downloading cover image...");

            const file = fs.createWriteStream(coverFile);
            https.get(thumbnail, response => {
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    resolve();
                });
            }).on('error', reject);
        });

        // Wait for both downloads to complete
        await Promise.all([audioPromise, coverPromise]);

        // Upload both files simultaneously to Cloudinary
        const audioUploadPromise = new Promise((resolve, reject) => {
            console.log("🎵 Uploading audio file to Cloudinary... ");

            cloudinary.uploader.upload(audioFile, {
                resource_type: "video",
                folder: "songs",
                public_id: id
            }, (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    console.log("🎵 Audio file uploaded successfully ✅");
                    resolve(result.secure_url);
                }
            });
        });

        const coverUploadPromise = new Promise((resolve, reject) => {
            console.log("📷 Uploading cover image to Cloudinary...");

            cloudinary.uploader.upload(coverFile, {
                resource_type: "image",
                folder: "covers",
                public_id: id
            }, (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    console.log("📷 Cover image uploaded successfully ✅");
                    resolve(result.secure_url);
                }
            });
        });

        // Wait for both uploads to complete
        const [songUrl, coverUrl] = await Promise.all([audioUploadPromise, coverUploadPromise]);

        // Clean up temporary files
        try {
            if (fs.existsSync(audioFile)) fs.unlinkSync(audioFile);
            if (fs.existsSync(coverFile)) fs.unlinkSync(coverFile);
            if (fs.existsSync(tempDir)) fs.rmdirSync(tempDir);
        } catch (cleanupError) {
            console.error("Cleanup error:", cleanupError);
        }

        console.log("\n============================================================");
        console.log("✅ UPLOAD COMPLETED SUCCESSFULLY");
        console.log("============================================================");
        console.log(`📝 Title: ${title}`);
        console.log(`🔗 Song URL: ${songUrl}`);
        console.log(`🖼️ Cover URL: ${coverUrl}`);
        console.log("============================================================\n");

        res.status(200).json({
            success: true,
            data: {
                title,
                id,
                artist,
                duration,
                songUrl,
                coverUrl
            }
        });

    } catch (error) {
        console.error("Upload process failed:", error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export default saveToCloudinary;