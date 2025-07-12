import axios from "axios";
import dotenv from "dotenv";
import cloudinaryModule from "cloudinary";
dotenv.config();

const cloudinary = cloudinaryModule.v2;
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

const http = axios.create({
    timeout: 60_000,
    responseType: "stream",
    headers: { "User-Agent": "Mozilla/5.0" }
});

const uploadFromUrl = (url, folder, type) =>
    new Promise(async (resolve, reject) => {
        try {
            const { data: stream } = await http.get(url);
            const cloudStream = cloudinary.uploader.upload_stream(
                { folder, resource_type: type },
                (err, res) => (err ? reject(err) : resolve(res.secure_url))
            );
            stream.pipe(cloudStream);
        } catch (err) {
            reject(err);
        }
    });

export const saveToCloud = async (req, res) => {
    const { audioUrl, coverUrl, id, title, artist, duration } = req.body;
    if (!audioUrl || !coverUrl || !id || !title)
        return res
            .status(400)
            .json({ success: false, message: "Required fields missing." });

    try {
        const { data } = await axios.post(
            "https://vivid-music.vercel.app/checkSongExistsByYtId",
            { id }
        );
        if (data.exists)
            return res
                .status(409)
                .json({ message: "Song already exists", title });

        const [coverPublicUrl, songPublicUrl] = await Promise.all([
            uploadFromUrl(coverUrl, "covers/", "image"),
            uploadFromUrl(audioUrl, "songs/", "video")
        ]);

        const { data: add } = await axios.post(
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

        return add.success
            ? res
                  .status(200)
                  .json({
                      success: true,
                      message: "Uploaded successfully",
                      title
                  })
            : res
                  .status(502)
                  .json({
                      success: false,
                      message: "Downstream addSong failed",
                      title
                  });
    } catch (err) {
        console.error("❌ Upload failed:", err);
        return res
            .status(500)
            .json({
                success: false,
                message: "Upload failed",
                title,
                error: String(err)
            });
    }
};


export default saveToCloud