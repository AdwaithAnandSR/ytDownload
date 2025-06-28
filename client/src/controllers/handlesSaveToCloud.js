import axios from "axios";
import Constants from "expo-constants";
import Toast from "react-native-toast-message";

let api = Constants.expoConfig.extra.adminApi;

const saveToCloud = async ({ coverUrl, songUrl, info, setUploadQueue }) => {
    try {
        setUploadQueue(prev => [
            { title: info.title, isUploaded: false, thumbnail: coverUrl, isFailed: false },
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
