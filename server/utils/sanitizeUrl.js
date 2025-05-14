const sanitizeYouTubeUrl = url => {
    try {
        const parsedUrl = new URL(url);
        const host = parsedUrl.hostname.replace("m.", "www."); // normalize mobile URL

        let videoId = null;

        if (host.includes("youtu.be")) {
            // Shortened URL
            videoId = parsedUrl.pathname.slice(1);
        } else if (host.includes("youtube.com")) {
            if (parsedUrl.searchParams.has("v")) {
                videoId = parsedUrl.searchParams.get("v");
            } else if (parsedUrl.pathname.startsWith("/embed/")) {
                videoId = parsedUrl.pathname.split("/")[2];
            } else if (parsedUrl.pathname.startsWith("/shorts/")) {
                videoId = parsedUrl.pathname.split("/")[2];
            }
        }

        if (!videoId || !/^[\w-]{11}$/.test(videoId)) {
            throw new Error("Invalid YouTube URL");
        }

        return `https://www.youtube.com/watch?v=${videoId}`;
    } catch {
        return null;
    }
};

export default sanitizeYouTubeUrl;
