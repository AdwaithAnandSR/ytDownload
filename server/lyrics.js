import fs from "fs";
import axios from "axios";
import { spawn } from "child_process";
import { Readable } from "stream";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

async function downloadAudio(url) {
    console.log("Downloading audio...");
    const response = await axios.get(url, { responseType: "stream" });
    return response.data;
}

async function convertToWavStream(inputStream) {
    console.log("Converting audio to WAV PCM stream...");
    const ffmpeg = spawn("ffmpeg", [
        "-i",
        "pipe:0",
        "-f",
        "wav",
        "-acodec",
        "pcm_s16le",
        "-ar",
        "16000",
        "-ac",
        "1",
        "pipe:1"
    ]);
    inputStream.pipe(ffmpeg.stdin);
    return ffmpeg.stdout;
}

async function streamToBuffer(stream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on("data", chunk => chunks.push(chunk));
        stream.on("end", () => resolve(Buffer.concat(chunks)));
        stream.on("error", reject);
    });
}

async function transcribe(buffer) {
    console.log("Running transcription...");
    const response = await openai.audio.transcriptions.create({
        file: buffer,
        model: "whisper-1",
        response_format: "verbose_json" // to get timestamps
    });
    return response;
}

(async () => {
    try {
        const url = process.env.URL; // Replace with your URL

        const audioStream = await downloadAudio(url);
        const wavStream = await convertToWavStream(audioStream);
        const wavBuffer = await streamToBuffer(wavStream);

        const transcript = await transcribe(wavBuffer);

        console.log("Lyrics with timestamps:");
        for (const segment of transcript.segments) {
            const start = segment.start.toFixed(2);
            const end = segment.end.toFixed(2);
            console.log(`[${start} - ${end}] ${segment.text.trim()}`);
        }
    } catch (error) {
        console.error("Error:", error);
    }
})();


export default transcribe