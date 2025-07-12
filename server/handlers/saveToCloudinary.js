import axios from "axios";
import axiosRetry from "axios-retry";
import cloudinaryModule from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

const cloudinary = cloudinaryModule.v2;
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

// ────────────────────────────────────────────────────────────
// AXIOS HELPERS
// ────────────────────────────────────────────────────────────
const FIVE_MINUTES = 5 * 60_000;

// Base HTTP client for downloading remote files (stream)
const http = axios.create({
    timeout: FIVE_MINUTES,
    responseType: "stream",
    headers: { "User-Agent": "Mozilla/5.0" }
});

// Attach an exponential-back-off retry policy (3 tries by default)
axiosRetry(http, {
    retries: 3,
    retryDelay: axiosRetry.exponentialDelay,
    retryCondition: err =>
        axiosRetry.isNetworkOrIdempotentRequestError(err) ||
        err.response?.status >= 500 // retry on 5xx
});

// Reuse the same policy for the *global* axios instance that you
// call `checkSongExistsByYtId` and `addSong` with:
axiosRetry(axios, {
    retries: 3,
    retryDelay: axiosRetry.exponentialDelay,
    retryCondition: err =>
        axiosRetry.isNetworkOrIdempotentRequestError(err) ||
        err.response?.status >= 500
});

// ────────────────────────────────────────────────────────────
// UTILITIES
// ────────────────────────────────────────────────────────────
const uploadFromUrl = (url, folder, type) =>
    new Promise(async (resolve, reject) => {
        try {
            const { data: stream } = await http.get(url); // inherits retry + 5-min timeout
            const cloudStream = cloudinary.uploader.upload_stream(
                { folder, resource_type: type },
                (err, res) => (err ? reject(err) : resolve(res.secure_url))
            );
            stream.pipe(cloudStream);
        } catch (err) {
            reject(err);
        }
    });

// ────────────────────────────────────────────────────────────
// CONTROLLER
// ────────────────────────────────────────────────────────────
export const saveToCloud = async (req, res) => {
    const { audioUrl, coverUrl, id, title, artist, duration } = req.body;

    console.log(`🍄 upload process started for ${title}...`);

    if (!audioUrl || !coverUrl || !id || !title) {
        return res
            .status(400)
            .json({ success: false, message: "Required fields missing." });
    }

    try {
        // Check for duplicates (inherits retry policy)
        const { data } = await axios.post(
            "https://vivid-music.vercel.app/checkSongExistsByYtId",
            { id }
        );
        if (data.exists) {
            return res
                .status(409)
                .json({ message: "Song already exists", title });
        }

        // Parallel upload (inherits retry + 5-min timeout on downloads)
        const [coverPublicUrl, songPublicUrl] = await Promise.all([
            uploadFromUrl(coverUrl, "covers/", "image"),
            uploadFromUrl(audioUrl, "songs/", "video")
        ]);

        // Persist metadata (inherits retry policy)
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
            ? res.status(200).json({
                  success: true,
                  message: "Uploaded successfully",
                  title
              })
            : res.status(502).json({
                  success: false,
                  message: "Downstream addSong failed",
                  title
              });
    } catch (err) {
        console.error("❌ Upload failed:", err);
        return res.status(500).json({
            success: false,
            message: "Upload failed",
            title,
            error: String(err)
        });
    }
    finally{
        console.log("process completed: ", title);
    }
};

export default saveToCloud;
