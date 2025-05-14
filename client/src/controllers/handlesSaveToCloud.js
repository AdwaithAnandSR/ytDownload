import axios from "axios";
import Constants from "expo-constants";

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
        setInfo({ error });
    }
};

export default saveToCloud;
