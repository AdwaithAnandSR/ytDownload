import express from "express";
import cors from "cors";
import { exec } from "child_process";

const port = 3000;
const app = express();

import handleGetInfo from "./handlers/getInfo.js";
import handleSetCookie from "./handlers/setCookie.js";

import sanitizeUrl from "./utils/sanitizeUrl.js";
import sortFormates from "./utils/sortFormates.js";


app.use(express.json());
app.use(cors());

app.post("/setCookie", handleSetCookie);

app.post("/getInfo", (req, res) => {
    let { url } = req.body;

    url = sanitizeUrl(url);

    console.log(url);

    if (!url) return res.status(400).json({ error: "Missing YouTube URL" });

    const cmd = `yt-dlp --cookies cookies.txt -j "${url}"`;

    exec(cmd, (error, stdout, stderr) => {
        if (error) {
            console.error(stderr);
            return res
                .status(500)
                .json({ error: "Failed to fetch info", detail: stderr });
        }

        try {
            const info = JSON.parse(stdout);

            const { audioQuality, videoQuality } = sortFormates(info.formats);

            res.json({
                title: info.title,
                uploader: info.uploader,
                duration: info.duration,
                thumbnail: info.thumbnail,
                audioQuality,
                videoQuality
            });
        } catch (err) {
            res.status(500).json({
                error: "JSON parse error",
                detail: err.message
            });
        }
    });
});

app.get("/info", async (req, res) => {
    let { url } = req.query;

    url = sanitizeUrl(url);

    if (!url) return res.status(400).json({ error: "Missing YouTube URL" });

    const cmd = `yt-dlp --cookies cookies.txt -j "${url}"`;

    exec(cmd, (error, stdout, stderr) => {
        if (error) {
            console.error(stderr);
            return res
                .status(500)
                .json({ error: "Failed to fetch info", detail: stderr });
        }

        try {
            const info = JSON.parse(stdout);

            res.json({
                title: info.title,
                uploader: info.uploader,
                duration: info.duration,
                thumbnail: info.thumbnail,
                formats: info.formats,
                audio_formats: info.formats
                    .filter(f => f.asr && f.ext === "m4a")
                    .map(f => ({
                        quality: f.abr,
                        format: f.format,
                        ext: f.ext,
                        url: f.url
                    }))
            });
        } catch (err) {
            res.status(500).json({
                error: "JSON parse error",
                detail: err.message
            });
        }
    });
});

// https://www.youtube.com/watch?v=dQw4w9WgXcQ

app.listen(port, () => console.log("app started"));
