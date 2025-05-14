import { useState, useEffect } from "react";
import Constants from "expo-constants";
import axios from "axios";

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
                if (exists.length < 1 && res.data)
                    setDownloadQueue(prev => [res.data, ...prev]);
            } catch (error) {
                console.log(error);
            }
        };
        handleFetchInfo();
    }, [url]);
};

export default useGetInfo;
