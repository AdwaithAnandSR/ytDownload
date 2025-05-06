import express from "express";
import cors from "cors";

import play from "play-dl";
import {fileTypeFromBuffer} from 'file-type';


const app = express();

function convertMobileToDesktopYouTubeUrl(url) {
    url = url.replace("https://m.youtube.com", "https://www.youtube.com");
    url = url.replace(/\s/g, "");
    return url;
}

const download = async url => {
    console.log(`url: ${url}`);
    // validating
    if (!(await play.yt_validate(url))) return console.log("not a valid url");

    const video = await play.video_basic_info(url);
    const title = video.video_details.title;
    const thumbnail = video.video_details.thumbnails.pop().url;

    // const existsSong = await musicModel.findOne({ title });
    // if (existsSong)
    //     return res.status(409).json({ message: "song already exists!", title });

    // 2. Get audio stream
    const { stream, type } = await play.stream(url, { quality: 2 });

    // 3. Collect audio buffer
    const audioChunks = [];
    for await (const chunk of stream) {
        audioChunks.push(chunk);
    }
    const audioBuffer = Buffer.concat(audioChunks);

    // 4. Get cover image buffer
    const coverResponse = await axios.get(thumbnail, {
        responseType: "arraybuffer"
    });
    const coverBuffer = Buffer.from(coverResponse.data);

    const audioType = await fileTypeFromBuffer(audioBuffer);
    const coverType = await fileTypeFromBuffer(coverBuffer);
    
    
    console.log(audioType);
    console.log(coverType);
    console.log(title);
};

download(
    convertMobileToDesktopYouTubeUrl(
        "https://m.youtube.com/watch?v=mYUfLYmwJNg&pp =ygULQmx1ZSBidWNrZXQ%3D"
    )
);

app.use(cors());
app.listen(3000, () => {
    console.log("running...");
});
