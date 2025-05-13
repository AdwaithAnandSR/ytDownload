const express = require("express");
const { exec } = require("child_process");

const port = 3000;
const app = express();

app.use(express.json());
app.use(require("cors")());

app.get("/info", async (req, res) => {
    const { url } = req.query;

    if (!url) return res.status(400).json({ error: "Missing YouTube URL" });

    const cmd = `yt-dlp --dump-json "${url}"`;

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
