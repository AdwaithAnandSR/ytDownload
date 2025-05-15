import { useState, useEffect } from "react";
import Constants from "expo-constants";
import axios from "axios";
import Toast from "react-native-toast-message";

import { useAppState } from "../contexts/state.context.js";

const api = Constants.expoConfig.extra.adminApi;

const useGetInfo = ({ url }) => {
    const { setDownloadQueue, uploadQueue } = useAppState();

    useEffect(() => {
        if (!url) return;

        const handleFetchInfo = async () => {
            try {
                const res = await axios.post(`${api}/getInfo`, { url });
                const exists = uploadQueue.filter(
                    item => item.title === res.data.title
                );
                if (exists.length < 1 && res.data){
                    setDownloadQueue(prev => [res.data, ...prev]);
                    Toast.show({
                    type: "success",
                    text1: "Loaded To Downloads Queue",
                    text2: res?.data?.title,
                });
                }
            } catch (error) {
                console.log(error);
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
        handleFetchInfo();
    }, [url]);
};

export default useGetInfo;
