import Constants from "expo-constants";
import axios from "axios";
import Toast from "react-native-toast-message";

let api = Constants.expoConfig.extra.adminApi;

const handleFetchInfo = async url => {
    try {
        Toast.show({
            type: "info",
            text1: "getting info ..."
        });

        let id = Date.now();

        const res = await axios.post(`${api}/getInfo`, { url, id });
        const data = res?.data?.data;

        return data;
    } catch (error) {
        console.log(error.response.status == 410);
        if (error.response.status == 410)
            Toast.show({
                type: "error",
                text1: "Song Already Exists",
                text2: error.response.data.title
            });
        else
            Toast.show({
                type: "error",
                text1: JSON.stringify(error?.message || error),
                text2: JSON.stringify(
                    error?.response?.data?.detail ||
                        error?.response?.data?.error
                )
            });
    }
};

export default handleFetchInfo;
