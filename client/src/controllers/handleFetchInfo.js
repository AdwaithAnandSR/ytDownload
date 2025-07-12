import Constants from "expo-constants";
import axios from "axios";
import Toast from "react-native-toast-message";

// let api = Constants.expoConfig.extra.adminApi;

// api = "https://0b03a10c-a786-425b-b9b5-6bfe917653dc-00-3ahkqrhxdms07.pike.replit.dev";

const handleFetchInfo = async (url, api) => {
    try {
        Toast.show({
            type: "info",
            text1: "getting info ...",
            text2: `${api}`
        });

        console.log(api);

        let id = Date.now();

        const res = await axios.post(`${api}/getInfo`, { url, id });
        const data = res?.data?.data;

        let splitTitle = data.title.split(" ");
        let searchText = `${splitTitle[0]} ${splitTitle[1]}`;

        console.log(searchText);

        const searchResult = await axios.post(
            "https://vivid-music.vercel.app/searchSong",
            { text: searchText }
        );

        const songs = searchResult.data.songs

        // console.log(res.data?.searchResult);

        return {data, songs};
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
