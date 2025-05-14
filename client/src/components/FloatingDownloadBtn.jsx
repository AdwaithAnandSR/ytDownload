import React from "react";
import { TouchableOpacity, StyleSheet, Dimensions, View } from "react-native";
import { MaterialIcons, Feather } from "@expo/vector-icons";
import { router } from "expo-router";

const { width: vw, height: vh } = Dimensions.get("window");

const FloatingDownloadBtn = ({ handlePress }) => {
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
                onPress={handlePress}
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
        width: vw * 0.35,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderRadius: vw * 0.05,
        paddingHorizontal: vw * 0.03,
        backgroundColor: "#f80c77"
    },
    floatingBtn: {
        backgroundColor: "#05fd8f",
        height: vh * 0.06,
        width: vh * 0.06,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: vw * 0.5,
    }
});

export default FloatingDownloadBtn;
