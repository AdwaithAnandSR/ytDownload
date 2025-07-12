import axios from "axios";
import Toast from "react-native-toast-message";
// import Constants from "expo-constants";

// let api = Constants.expoConfig.extra.adminApi;
// // api = "http://localhost:7000";
// api =
//     "https://0b03a10c-a786-425b-b9b5-6bfe917653dc-00-3ahkqrhxdms07.pike.replit.dev";

const saveToCloud = async ({
    coverUrl,
    api,
    songUrl,
    info,
    setUploadQueue
}) => {
    try {
        setUploadQueue(prev => [
            {
                title: info.title,
                isUploaded: false,
                thumbnail: coverUrl,
                isFailed: false
            },
            ...prev
        ]);

        const res = await axios.post(`${api}/saveToCloud`, {
            audioUrl: songUrl,
            coverUrl,
            id: info.id,
            title: info.title,
            duration: info.duration,
            artist: info.artist || "unknown"
        });

        setUploadQueue(prev =>
            prev.map(item =>
                item.title === res.data.title
                    ? { ...item, isUploaded: true }
                    : item
            )
        );
        Toast.show({
            type: "success",
            text1: "upload successfull",
            text2: res.data.title
        });
    } catch (error) {
        console.log(error);
        Toast.show({
            type: "error",
            text1: JSON.stringify(error?.message || error),
            text2: JSON.stringify(
                error?.response?.data?.title || error?.response?.data?.message
            )
        });
        setUploadQueue(prev =>
            prev.map(item =>
                item.title === error.response.data.title
                    ? { ...item, isFailed: true }
                    : item
            )
        );
    }
};

export default saveToCloud;
