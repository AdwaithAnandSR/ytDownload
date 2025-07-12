import axios from "axios";
import { spawn } from "child_process";

import sanitizeUrl from "../utils/sanitizeUrl.js";

function extractYouTubeID(url) {
    const match = url.match(
        /(?:v=|\/shorts\/|\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    return match ? match[1] : null;
}

const getFileInfo = async (req, res) => {
    let { url } = req.body;

    url = sanitizeUrl(url);
    if (!url) return res.status(400).json({ error: "Missing YouTube URL" });

    const existId = extractYouTubeID(url);
    if (existId) {
        const isExistsRes = await axios.post(
            "https://vivid-music.vercel.app/checkSongExistsByYtId",
            { id: existId }
        );

        if (isExistsRes.data.exists) {
            return res.status(410).json({
                message: "song already exists ",
                title: output.title
            });
        }
    }

    console.log("get info: ", url);
    // Spawn yt-dlp with cookies
    const ytdlp = spawn("yt-dlp", [
        "--verbose",
        "--dump-json",
        "--no-warnings",
        "--cookies",
        "./cookies.txt",
        "--user-agent",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
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
                    { id: output.id, title }
                );

                if (isExistsRes.data.exists) {
                    return res.status(410).json({
                        message: "song already exists ",
                        title: output.title
                    });
                }

                let splitTitle = output.title.split(" ");
                let searchText = `${splitTitle[0]} ${splitTitle[1]}`;

                const searchResult = await axios.post(
                    "https://vivid-music.vercel.app/searchSong",
                    { text: searchText }
                );
                
                console.log(searchResult.data)
                console.log(output.title);

                return res
                    .status(200)
                    .json({
                        success: true,
                        data: output,
                        searchResult: searchResult
                    });
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
