import express from "express";
import cors from "cors";
import { exec } from "child_process";

const port = 3000;
const app = express();

import handleSetCookie from "./handlers/setCookie.js";

import sanitizeUrl from "./utils/sanitizeUrl.js";
import sortFormates from "./utils/sortFormates.js";


app.use(express.json());
app.use(cors());

app.post("/setCookie", handleSetCookie);

app.post("/saveToCloud", (req, res) => {
    let { data , thumbnail} = req.body;
    
    console.log(data[0]);

    const [audioRes, thumbnailRes] = await Promise.all([
        axios.get(data[0].url, { responseType: "arraybuffer" }),
        axios.get(thumbnail, { responseType: "arraybuffer" })
    ]);

    const audioBuffer = Buffer.from(audioRes.data);
    const thumbnailBuffer = Buffer.from(thumbnailRes.data);

    // Log the buffers
    console.log("Audio Buffer:", audioBuffer.length);
    console.log("Thumbnail Buffer:", thumbnailBuffer.length);

});

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

app.listen(port, () => console.log("app started"));
