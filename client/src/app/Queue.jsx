import React from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Dimensions,
    Image
} from "react-native";
import { router } from 'expo-router';

import { useAppState } from "../contexts/state.context.js";

const { width: vw, height: vh } = Dimensions.get("window");

const QueueItem = ({ item }) => {
    return (
        <TouchableOpacity style={styles.queueItem}>
            <View style={styles.imgContainer}>
                <Image
                    source={{ uri: item.thumbnail }}
                    style={{ width: "100%", height: "100%" }}
                />
            </View>
            <Text
                style={[
                    styles.text,
                    { color: item.isUploaded ? "#00f16b" : "#fa5828" }
                ]}
                numberOfLines={1}
            >
                {item.title}
            </Text>
        </TouchableOpacity>
    );
};

const Queue = () => {
    const { uploadQueue } = useAppState();

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                <Text style={styles.backBtnText}>Back</Text>
            </TouchableOpacity>
            <FlatList
                data={uploadQueue}
                renderItem={QueueItem}
                ListEmptyComponent={() => (
                    <Text style={{ color: "white", textAlign: "center" }}>
                        no songs uploaded yet!
                    </Text>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "black"
    },
    backBtn:{
        padding: vw * 0.05,
    },
    backBtnText:{
        color: "white",
        fontSize: vw * 0.05,
        fontWeight: 'bold',
    },
    queueItem: {
        width: "100%",
        height: vh * 0.08,
        alignItems: "center",
        flexDirection: "row",
        gap: vw * 0.05,
        paddingHorizontal: vw * 0.05
    },
    imgContainer: {
        height: vh * 0.05,
        width: vh * 0.05,
        borderRadius: vw * 0.5,
        backgroundColor: "#232424"
    },
    text: {
        color: "white",
        width: "80%",
        fontSize: vw * 0.035
    }
});

export default Queue;
