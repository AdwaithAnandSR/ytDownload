import React from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    Dimensions,
    TouchableOpacity
} from "react-native";
import Entypo from "@expo/vector-icons/Entypo";

import AudioQuality from "./AudioQuality.jsx";

import { useAppState } from "../../contexts/state.context.js";
import handleSaveToCloud from "../../controllers/handlesSaveToCloud.js";

const { width: vw, height: vh } = Dimensions.get("window");

const StripeBody = ({ item: info }) => {
    const { setUploadQueue, setDownloadQueue } = useAppState();

    if (!info.title) return;

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
                <AudioQuality
                    setUploadQueue={setUploadQueue}
                    setDownloadQueue={setDownloadQueue}
                    info={info}
                />
            </View>
            <TouchableOpacity
                onPress={() =>
                    setDownloadQueue(prev =>
                        prev.filter(item => item.title != info.title)
                    )
                }
                style={styles.cancelBtn}
            >
                <Entypo name="cross" size={18} color="#f8064a" />
                <Text style={styles.buttonText}>CANCEL</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: vh * 0.01,
        alignItems: "center",
        paddingHorizontal: vw * 0.02,
        paddingVertical: vh * 0.03,
        paddingBottom: vh * 0.1
    },
    wrapper1: {
        flexDirection: "row",
        alignItems: "center",
        gap: vw * 0.03,
        height: "25%",
        width: "100%"
    },
    imgContainer: {
        width: vw * 0.16,
        height: vw * 0.16,
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
        
        flexDirection: "row",
        justifyContent: "center"
    },
    cancelBtn: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: vw * 0.01,
        marginTop: vh * 0.02
    },
    buttonText: {
        color: "#f8064a",
        fontSize: vw * 0.035,
        fontWeight: "bold"
    },
    text: {
        color: "white"
    }
});

export default StripeBody;
