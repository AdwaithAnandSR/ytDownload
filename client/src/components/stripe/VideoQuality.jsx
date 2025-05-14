import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native";

const { width: vw, height: vh } = Dimensions.get("window");

const VideoQuality = ({ info }) => {
    
    if(!info) return
    
    return (
        <View style={styles.videoQualityContainer}>
            <Text
                numberOfLines={2}
                style={[styles.detsText, { fontSize: vw * 0.07 }]}
            >
                Video
            </Text>

            {/* high quality */}
            <TouchableOpacity style={styles.quality}>
                <Text numberOfLines={2} style={styles.detsText}>
                    High Quality |
                </Text>
                <Text numberOfLines={2} style={styles.detsText}>
                    size:
                    {(
                        info?.videoQuality?.high[0]?.filesize /
                        (1024 * 1024)
                    ).toFixed(2)}
                </Text>
            </TouchableOpacity>

            {/* medium quality */}
            <TouchableOpacity style={styles.quality}>
                <Text numberOfLines={2} style={styles.detsText}>
                    Medium Quality |
                </Text>
                <Text numberOfLines={2} style={styles.detsText}>
                    size:
                    {(
                        info?.videoQuality?.medium[0]?.filesize /
                        (1024 * 1024)
                    ).toFixed(2)}
                </Text>
            </TouchableOpacity>

            {/* low quality */}
            <TouchableOpacity style={styles.quality}>
                <Text numberOfLines={2} style={styles.detsText}>
                    Low Quality |
                </Text>
                <Text numberOfLines={2} style={styles.detsText}>
                    size:
                    {(
                        info?.videoQuality?.low[0]?.filesize /
                        (1024 * 1024)
                    ).toFixed(2)}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    videoQualityContainer: {
        flex: 1,
        overflow: "hidden"
    },
    quality: {
        flexDirection: "row",
        gap: vw * 0.03,
        alignItems: "center",
        justifyContent: "center",
        padding: vw * 0.03,
        width: "100%"
    },
    detsText: {
        color: "white",
        fontSize: vw * 0.04,
        fontWeight: "bold",
        textAlign: "center"
    }
});

export default VideoQuality;
