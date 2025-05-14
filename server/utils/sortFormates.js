const sortFormates = formats => {
    // filtering audio and video formats
    const audioFormats = formats.filter(
        f => f.vcodec === "none" && f.acodec !== "none"
    );
    const videoFormats = formats.filter(f => f.vcodec !== "none");

    // sorting based on quality
    const sortByAudioQuality = (a, b) => (b.abr || 0) - (a.abr || 0);
    const sortByVideoQuality = (a, b) => (b.height || 0) - (a.height || 0);
    const sortedAudio = audioFormats.sort(sortByAudioQuality);
    const sortedVideo = videoFormats.sort(sortByVideoQuality);

    // categories as high, medium and low
    const categorize = list => {
        const high = list[0] ? [list[0]] : [];
        const medium = list[1] ? [list[1]] : [];
        const low =
            list[list.length - 1] && list.length > 2
                ? [list[list.length - 1]]
                : [];
        return { high, medium, low };
    };
    const audioQuality = categorize(sortedAudio);
    const videoQuality = categorize(sortedVideo);

    return { audioQuality, videoQuality };
};

export default sortFormates;
