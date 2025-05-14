import  express from "express"
import  cors from "cors"
import  fs from "fs"
import { exec } from "child_process"

const port = 3000;
const app = express();

import handleGetInfo from "./handlers/getInfo.js"

app.use(express.json());
app.use(cors())

function convertToNetscapeCookies(cookieString, domain = ".youtube.com") {
    const cookies = cookieString.split("; ").map(cookie => {
        const [name, ...valParts] = cookie.split("=");
        const value = valParts.join("=");
        return {
            domain,
            flag: "TRUE",
            path: "/",
            secure: "FALSE",
            expires: 2147483647,
            name: name.trim(),
            value: value.trim()
        };
    });

    let output = "# Netscape HTTP Cookie File\n";
    cookies.forEach(c => {
        output += `${c.domain}\t${c.flag}\t${c.path}\t${c.secure}\t${c.expires}\t${c.name}\t${c.value}\n`;
    });
    return output;
}

const newCookie = convertToNetscapeCookies(
    "SIDCC=AKEyXzWlHayIjBvjbVtEJBfL_2ctwt5QzrORBzlTtOQUk5yb1YzCvSevr3GmW2ZqUwgImCa2; __Secure-1PSID=g.a000wwiLpJJL_7Y60CWER8bT_mx2ngFdxlLel1DvANdiLmj-no7A4FPMwxAkgumfiscaq1XIwAACgYKATUSARUSFQHGX2MivG-KFp2Pa8AAmwaic7CDxRoVAUF8yKqCrNuMkleDWu2DZLdj1nQn0076; __Secure-3PSIDCC=AKEyXzWpHHRLF3xpLKxGDDPx-ypTo3chztN2Pr9mxdQUkwnWZytsnHEMMdbpUpGpsaU2hjyStg; __Secure-3PAPISID=wh6PCTksQFKlJnAp/A97lUlrx6VignHljp; __Secure-1PAPISID=wh6PCTksQFKlJnAp/A97lUlrx6VignHljp; LOGIN_INFO=AFmmF2swRAIgegyEpqxQOk27F8iqyz62mfa5LzP-dUaoLFd5Ty80EhkCIEBcj7y0VhepLi0HGk8qFTuvERcxU2_ZNiV_kNZI5Uox:QUQ3MjNmeXh2T3J3LWVlclBpZFB4ZFF5ejFFa3h0Q0Rlb0M2TG1zWktRNjZRdG5SeXdpejZYd1pKOEs2NlhYZlA0eWYza3BDZ2oweEFRbHZSYk1RUTdlNWUxQUtHUllXX29Qdy15TjdWdkxjdUNUd0FWU2haWExVNHZ4SmY5aFB3b3FRSEdsbjJwSUcyQnluN3Vua1NzbTMwYTMwSHI1ODR3; SAPISID=wh6PCTksQFKlJnAp/A97lUlrx6VignHljp; PREF=f6=40000000&tz=Asia.Calcutta&f7=100; __Secure-3PSIDTS=sidts-CjIBjplskMjhNmTxzxTsmrYDgs7cjohoNWWgZzYgrfcahCNm2ciTZSAN378txOYvKVmZOBAA; HSID=AAPrjYrvwBBrXC57t; __Secure-1PSIDTS=sidts-CjIBjplskMjhNmTxzxTsmrYDgs7cjohoNWWgZzYgrfcahCNm2ciTZSAN378txOYvKVmZOBAA; _Secure-3PSID=g.a000wwiLpJJL_7Y60CWER8bT_mx2ngFdxlLel1DvANdiLmj-no7A_5onjPbwIB1TrRUZ_gz29QACgYKAX8SARUSFQHGX2MiKOMU4r1pShrOe6qjmLI7jRoVAUF8yKqY-WTUDJriE-z9aaJgaMTY0076; VISITOR_PRIVACY_METADATA=CgJJThIEGgAgEA%3D%3D; APISID=eaMyNQ2BTx0pJBLo/Av-OWQ8BtFE_ab7L; SID=g.a000wwiLpJJL_7Y60CWER8bT_mx2ngFdxlLel1DvANdiLmj-no7ApQNWDUni6yvWmeYMbWs5owACgYKAXMSARUSFQHGX2MiEmJNQ4cqd-KkKgxc1N7OHBoVAUF8yKqVW8XBpoD1Z7Ke8D8NF2hz0076; VISITOR_INFO1_LIVE=aBDvfcCG7R0; __Secure-ROLLOUT_TOKEN=CMvgk66439O42wEQg_vby46OjQMY1OT60cedjQM%3D; __Secure-1PSIDCC=AKEyXzV0jCs7GBcZ5LdUjAlm9Niyp40H90A8UBnl69EWzSYTg9N_45n1_XdMO-vI6LQvUslCRg; SSID=ANSyzJ5XAoWPnU-az; YSC=xkWcujshsak"
);

fs.writeFileSync("cookies.txt", newCookie);



app.post("/info", handleGetInfo);

app.get("/info", async (req, res) => {
    const { url } = req.query;

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
