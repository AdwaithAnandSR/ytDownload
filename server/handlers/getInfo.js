import { exec } from "child_process"
import sanitizeUrl from "../utils/sanitizeUrl.js"

const handleGetInfo = async (req, res) => {
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
};

export default handleGetInfo