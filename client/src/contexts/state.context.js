import { useState, useEffect, createContext, useContext } from "react";
import Constants from "expo-constants";

let serverApi = Constants.expoConfig.extra.adminApi;

const StateContext = createContext();

export const StateProvider = ({ children }) => {
    const [info, setInfo] = useState({});
    const [downloadQueue, setDownloadQueue] = useState([]);
    const [uploadQueue, setUploadQueue] = useState([]);
    const [api, setApi] = useState(serverApi || '');

    return (
        <StateContext.Provider
            value={{
                info,
                setInfo,
                downloadQueue,
                setDownloadQueue,
                uploadQueue,
                setUploadQueue,
                api,
                setApi
            }}
        >
            {children}
        </StateContext.Provider>
    );
};

export const useAppState = () => useContext(StateContext);
