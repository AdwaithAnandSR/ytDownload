import React from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    Dimensions,
    TouchableOpacity
} from "react-native";

import VideoQuality from "./VideoQuality.jsx";
import AudioQuality from "./AudioQuality.jsx";

import { useAppState } from "../../contexts/state.context.js";
import handleSaveToCloud from "../../controllers/handlesSaveToCloud.js";

const { width: vw, height: vh } = Dimensions.get("window");

const StripeBody = ({ item: info }) => {
    const { setUploadQueue, setDownloadQueue } = useAppState();

    if (info.error)
        return (
            <View style={styles.container}>
                <Text style={styles.text}>
                    {info?.error?.response?.data?.detail
                        ? String(info.error.response.data.detail)
                        : String(info?.error?.response?.data?.error)
                        ? String(info?.error?.response?.data?.error)
                        : String(info.error)}
                </Text>
            </View>
        );

    const handleClick = quality => {
        let data;
        if (quality === "high") data = info?.audioQuality?.high[0];
        else if (quality === "medium") data = info?.audioQuality?.medium[0];
        else if (quality === "low") data = info?.audioQuality?.low[0];

        handleSaveToCloud(data, info.thumbnail, info.title, setUploadQueue);
        setDownloadQueue(prev =>
            prev.filter(item => item.title !== info.title)
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.wrapper1}>
                <View style={styles.imgContainer}>
                    <Image
                        source={{ uri: info?.thumbnail }}
                        style={{ width: "100%", height: "100%" }}
                    />
                </View>
                <Text numberOfLines={2} style={styles.title}>
                    {info?.title}
                </Text>
            </View>
            <View style={styles.wrapper2}>
                <AudioQuality handleClick={handleClick} info={info} />
                {/*<VideoQuality info={info} />*/}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: vh * 0.01,
        alignItems: "center",
        paddingHorizontal: vw * 0.02
    },
    wrapper1: {
        flexDirection: "row",
        alignItems: "center",
        gap: vw * 0.03,
        height: "20%",
        width: "100%"
    },
    imgContainer: {
        width: vw * 0.18,
        height: vw * 0.18,
        borderRadius: vw * 0.05,
        overflow: "hidden",
        backgroundColor: "#232323"
    },
    title: {
        color: "white",
        fontSize: vw * 0.04,
        fontWeight: "bold",
        width: vw * 0.7
    },
    wrapper2: {
        width: "100%",
        marginTop: vh * 0.03,
        flexDirection: "row",
        justifyContent: "center"
    },
    button: {
        width: "85%",
        height: vh * 0.07,
        borderRadius: vw * 0.05,
        backgroundColor: "#06f946",
        justifyContent: "center",
        alignItems: "center",
        marginTop: vh * 0.05
    },
    buttonText: {
        color: "white",
        fontSize: vw * 0.06,
        fontWeight: "bold"
    },
    text: {
        color: "white"
    }
});

export default StripeBody;
