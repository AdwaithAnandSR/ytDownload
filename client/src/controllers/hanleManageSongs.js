import axios from "axios";
import Constants from "expo-constants";
import Toast from "react-native-toast-message";

let api = Constants.expoConfig.extra.adminApi;

// api = "http://localhost:5000";

export const deleteSong = async id => {
    try {
        const res = await axios.post(`${api}/admin/deleteSong`, { id });
        if (res.data.success)
            Toast.show({
                type: "success",
                text1: "song deleted"
            });
        else
            Toast.show({
                type: "error",
                text1: "song deleted unsuccessfully"
            });
    } catch (error) {
        console.error(error);
        Toast.show({
            type: "error",
            text1: "song deleted unsuccessfully"
        });
    }
};

export const swapLyric = async id => {
    try {
        const res = await axios.post(`${api}/admin/swapLyric`, { id });
        if (res.data.success)
            Toast.show({
                type: "success",

                text1: "lyric swapped"
            });
        else
            Toast.show({
                type: "error",
                text1: "lyric swapped unsuccessfully"
            });
    } catch (error) {
        console.error(error);
        Toast.show({
            type: "error",
            text1: "lyric swapped unsuccessfully"
        });
    }
};

export const deleteLyric = async (id, index) => {
    try {
        const res = await axios.post(`${api}/admin/removeLyric`, { id, index });
        if (res.data.success)
            Toast.show({
                type: "success",
                text1: "lyric deleted"
            });
        else
            Toast.show({
                type: "error",
                text1: "lyric deleted unsuccessfully"
            });
    } catch (error) {
        console.error(error);
        Toast.show({
            type: "error",
            text1: "lyric deleted unsuccessfully"
        });
    }
};

export const updateArtist = async (id, artist) => {
    try {
        const res = await axios.post(`${api}/admin/updateArtist`, {
            id,
            artist
        });
        if (res.data.success)
            Toast.show({
                type: "success",
                text1: "artist updated"
            });
        else
            Toast.show({
                type: "error",
                text1: "artist update unsuccessfully"
            });
    } catch (error) {
        console.error(error);
        Toast.show({
            type: "error",
            text1: "artist update unsuccessfully"
        });
    }
};
