import fs from "fs";
import tmp from "tmp";
import dotenv from "dotenv";
import axios from "axios";
import { spawn } from "child_process";
dotenv.config();

import sanitizeUrl from "../utils/sanitizeUrl.js";

const getFileInfo = async (req, res) => {
    let { url } = req.body;

    url = sanitizeUrl(url);
    if (!url) return res.status(400).json({ error: "Missing YouTube URL" });
    if (!cookieContent) {
        console.error("No cookie found in .env (YTDLP_COOKIES)");
        return res.status(401).json({
            success: false,
            message: "No cookie found in .env (YTDLP_COOKIES)"
        });
    }
    // Spawn yt-dlp with cookies
    const ytdlp = spawn("yt-dlp", [
        "--dump-json",
        "--no-warnings",
        "--cookies",
        "../cookies.txt",
        url
    ]);

    let json = "";

    ytdlp.stdout.on("data", data => {
        json += data.toString();
    });

    ytdlp.stderr.on("data", data => {
        console.error(`stderr: ${data}`);
    });

    ytdlp.on("close", async code => {
        if (code === 0) {
            try {
                const metadata = JSON.parse(json);
                const audioFormats = metadata.formats.filter(
                    f => f.vcodec === "none"
                );

                const output = {
                    id: metadata.id,
                    title: metadata.title,
                    artist: metadata.artist,
                    duration: metadata.duration,
                    thumbnail: metadata.thumbnail,
                    audioFormats: audioFormats.map(f => ({
                        format_id: f.format_id,
                        ext: f.ext,
                        abr: f.abr,
                        filesize: f.filesize,
                        format_note: f.format_note,
                        url: f.url
                    }))
                };

                const isExistsRes = await axios.post(
                    "https://vivid-music.vercel.app/checkSongExistsByYtId",
                    { id: output.id }
                );

                if (isExistsRes.data.exists) {
                    return res.status(410).json({
                        message: "song already exists ",
                        title: output.title
                    });
                }

                console.log(output.title);
                return res.status(200).json({ success: true, data: output });
            } catch (err) {
                console.error("Failed to parse JSON:", err);
                return res.status(450).json({
                    success: false,
                    message: `Failed to parse JSON`
                });
            } finally {
                tmpFile.removeCallback();
            }
        } else {
            console.error(`yt-dlp exited with code ${code}`);
            return res.status(450).json({
                success: false,
                message: `yt-dlp exited with code ${code}`
            });
        }
    });
};

// Example usage
export default getFileInfo;
