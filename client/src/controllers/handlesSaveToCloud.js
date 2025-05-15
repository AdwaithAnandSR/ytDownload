import axios from "axios";
import Constants from "expo-constants";
import Toast from "react-native-toast-message";

const api = Constants.expoConfig.extra.adminApi;

const saveToCloud = async (
    selectedQuality,
    thumbnail,
    title,
    setUploadQueue
) => {
    try {
        setUploadQueue(prev => [
            { title, isUploaded: false, thumbnail },
            ...prev
        ]);

        const res = await axios.post(
            `https://ytdownloadserver-v2ru.onrender.com/saveToCloud`,
            { data: selectedQuality, thumbnail, title }
        );

        const uploaded = res.data.title;

        setUploadQueue(prev =>
            prev.map(item =>
                item.title === uploaded ? { ...item, isUploaded: true } : item
            )
        );
    } catch (error) {
        console.log(error);
        Toast.show({
            type: "error",
            text1: JSON.stringify(error?.message || error),
            text2: JSON.stringify(
                error?.response?.data?.title || error?.response?.data?.message
            )
        });
    }
};

export default saveToCloud;
