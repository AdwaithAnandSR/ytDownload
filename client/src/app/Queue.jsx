import { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Dimensions,
    Image,
    TextInput
} from "react-native";
import { router } from "expo-router";
import CookieManager from "@react-native-cookies/cookies";
import axios from "axios";
import Toast from "react-native-toast-message";

import { useAppState } from "../contexts/state.context.js";

const { width: vw, height: vh } = Dimensions.get("window");

const handleCookie = api => {
    CookieManager.get("https://youtube.com").then(async cookie => {
        const res = await axios.post(`${api}/setCookie`, { cookie });
        if (res.data.success)
            Toast.show({
                type: "success",
                text1: "Cookie Added"
            });
        else
            Toast.show({
                type: "error",
                text1: "Cookie Adding Failed"
            });
    });
};

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
    const { uploadQueue, api, setApi } = useAppState();
    const [apiVal, setApiVal] = useState(api || "");

    return (
        <View style={styles.container}>
            <View style={styles.nav}>
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => router.back()}
                >
                    <Text style={styles.backBtnText}>Back</Text>
                </TouchableOpacity>

                <TextInput
                    style={{
                        width: 200,
                        height: 50,
                        backgroundColor: "#181717",
                        color: "white",
                        borderRadius: 23,
                    }}
                    value={api}
                    onChangeText={txt => setApi(txt)}
                />

                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => handleCookie(api)}
                >
                    <Text style={styles.backBtnText}>Get Cookie</Text>
                </TouchableOpacity>
            </View>
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
    nav: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: vw * 0.03
    },
    backBtn: {
        padding: vw * 0.05
    },
    backBtnText: {
        color: "white",
        fontSize: vw * 0.05,
        fontWeight: "bold"
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
