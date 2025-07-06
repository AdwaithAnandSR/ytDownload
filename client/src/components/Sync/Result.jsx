import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";

const RenderItem = ({ item, showL2 }) => {
    
    return (
        <View style={styles.lyrics}>
            <Text numberOfLines={1} style={styles.text}>
                {item?.start}
            </Text>
            <Text numberOfLines={1} style={styles.line}>
                {item?.line}
            </Text>
            <Text numberOfLines={1} style={styles.text}>
                {item?.end}
            </Text>
        </View>
    );
};

const Result = ({ syncedLyricRef }) => {
    return (
        <View style={styles.syncLyricCont}>
            <FlatList
                data={syncedLyricRef.current}
                renderItem={({ item }) => <RenderItem item={item} />}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    syncLyricCont: {
        width: "90%",
        height: "80%",
        position: "absolute",
        zIndex: 999,
        left: "50%",
        top: "60%",
        transform: [{ translateX: "-50%" }, { translateY: "-50%" }],
        backgroundColor: "#03b880"
    },
    text: {
        width: "10%",
        overflow: "hidden"
    },
    line: {
        textAlign: "center",
        width: "70%",
        overflow: "hidden"
    },
    lyrics: {
        flexDirection: "row",
        gap: 8,
        justifyContent: "space-between",
        padding: 10
    }
});

export default Result;
