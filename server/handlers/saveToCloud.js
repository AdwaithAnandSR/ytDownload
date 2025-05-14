import axios from "axios";
import musicModel from "../models/music.js";
import admin from "firebase-admin";
import { v4 as uuidv4 } from "uuid";
import { fileTypeFromBuffer } from "file-type";

import serviceAccount from "../service/firebase.js";

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "gs://vividmusic-d6d28.appspot.com"
});
const bucket = admin.storage().bucket();

const saveToCloud = async (req, res) => {
    console.log("saving to cloud...");
    try {
        let { data, thumbnail, title } = req.body;

        const [audioRes, thumbnailRes] = await Promise.all([
            axios.get(data.url, { responseType: "arraybuffer" }),
            axios.get(thumbnail, { responseType: "arraybuffer" })
        ]);

        const audioBuffer = Buffer.from(audioRes.data);
        const coverBuffer = Buffer.from(thumbnailRes.data);

        const audioType = await fileTypeFromBuffer(audioBuffer);
        const coverType = await fileTypeFromBuffer(coverBuffer);

        const songFile = bucket.file(`songs/${title}.mp3`);
        const coverFile = bucket.file(`covers/${title}.jpg`);

        await songFile.save(audioBuffer, {
            metadata: { contentType: audioType.mime }
        });

        await coverFile.save(coverBuffer, {
            metadata: { contentType: coverType.mime }
        });

        const [songURL] = await songFile.getSignedUrl({
            action: "read",
            expires: "03-09-9999"
        });

        const [coverURL] = await coverFile.getSignedUrl({
            action: "read",
            expires: "03-09-9999"
        });

        // add to mongodb

        const result = await musicModel.create({
            cover: coverURL || null,
            url: songURL,
            title
        });

        console.log(result);

        return res.json({
            message: `upload successfull: ${title}`,
            title
        });
    } catch (error) {
        console.log(error);
        res.json({
            message: `upload failed: ${title}`,
            error,
            
        });
    }
};

export default saveToCloud;
