import { useState, useEffect, createContext, useContext } from "react";

const StateContext = createContext();

export const StateProvider = ({ children }) => {
    const [info, setInfo] = useState({});
    const [downloadQueue, setDownloadQueue] = useState([]);
    const [uploadQueue, setUploadQueue] = useState([]);

    return (
        <StateContext.Provider
            value={{
                info,
                setInfo,
                downloadQueue,
                setDownloadQueue,
                uploadQueue,
                setUploadQueue
            }}
        >
            {children}
        </StateContext.Provider>
    );
};

export const useAppState = () => useContext(StateContext);
