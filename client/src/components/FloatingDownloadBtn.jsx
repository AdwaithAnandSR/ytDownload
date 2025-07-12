import React from "react";
import { TouchableOpacity, StyleSheet, Dimensions, View } from "react-native";
import { MaterialIcons, Feather } from "@expo/vector-icons";
import { router } from "expo-router";

import { useAppState } from "../contexts/state.context.js";
import handleGetInfo from "../controllers/handleFetchInfo.js";

import Toast from "react-native-toast-message";

const { width: vw, height: vh } = Dimensions.get("window");

const FloatingDownloadBtn = ({ setIsStripeVisible, handleGetUrl }) => {
    const { setDownloadQueue, uploadQueue, api } = useAppState();

    return (
        <View style={styles.container}>
            <TouchableOpacity
                activeOpacity={0.8}
                style={styles.floatingBtn}
                onPress={() => router.push("Queue")}
            >
                <Feather name="list" size={30} color="#f80c77" />
            </TouchableOpacity>
            <TouchableOpacity
                activeOpacity={0.8}
                style={styles.floatingBtn}
                onPress={async () => {
                    const url = await handleGetUrl();

                    const {data, songs} = await handleGetInfo(url, api);
                    if(!data) return
                    setDownloadQueue(prev => {
                        if (
                            !prev.some(item => item.title === data.title) &&
                            !uploadQueue.some(item => item.title === data.title && !item.isFailed)
                        ) {
                            Toast.show({
                                type: "success",
                                text1: "Loaded to Downloads Queue",
                                text2: data.title
                            });
                            return [{...data, searchResult: songs}, ...prev];
                        }
                        return prev;
                    });
                }}
            >
                <Feather name="info" size={30} color="#f80c77" />
            </TouchableOpacity>
            <TouchableOpacity
                onPress={() => setIsStripeVisible(true)}
                activeOpacity={0.8}
                style={styles.floatingBtn}
            >
                <MaterialIcons name="download" size={30} color="#f80c77" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        right: vw * 0.08,
        bottom: vh * 0.1,
        height: vh * 0.08,
        minWidth: vw * 0.4,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderRadius: vw * 0.05,
        paddingHorizontal: vw * 0.03,
        backgroundColor: "#f80c77",
        gap: 10
    },
    floatingBtn: {
        backgroundColor: "#05fd8f",
        height: vh * 0.055,
        width: vh * 0.055,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: vw * 0.5
    }
});

export default FloatingDownloadBtn;
