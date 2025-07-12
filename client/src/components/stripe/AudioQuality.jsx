import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions
} from "react-native";
import axios from "axios";
import { useAppState } from "../../contexts/state.context.js"

const { width: vw, height: vh } = Dimensions.get("window");

import handleSaveToCloud from "../../controllers/handlesSaveToCloud.js";

const AudioQuality = ({ info, setDownloadQueue, setUploadQueue }) => {
    if (!info.title) return;
    const { api } = useAppState()

    return (
        <View style={styles.audioQualityContainer}>
            <Text
                numberOfLines={2}
                style={[styles.detsText, { fontSize: vw * 0.07 }]}
            >
                Audio
            </Text>

            {/* high quality */}

            {info?.audioFormats
                ?.sort((a, b) => b.filesize - a.filesize)
                .map((item, index) => {
                    if (item.abr === 0 || !item.filesize) return;

                    return (
                        <TouchableOpacity
                            key={index}
                            onPress={() => {
                                handleSaveToCloud({
                                    coverUrl: info?.thumbnail,
                                    songUrl: item.url,
                                    info: info,
                                    setUploadQueue,
                                    api
                                });
                                setDownloadQueue(prev =>
                                    prev.filter(
                                        elem => elem?.title !== info.title
                                    )
                                );
                            }}
                            style={styles.quality}
                        >
                            <Text
                                numberOfLines={2}
                                style={[
                                    styles.detsText,
                                    {
                                        textTransform: "uppercase"
                                    }
                                ]}
                            >
                                {item.format_note}
                            </Text>
                            <Text numberOfLines={2} style={styles.detsText}>
                                size:
                                {(item?.filesize / (1024 * 1024)).toFixed(2)}
                            </Text>
                            <Text numberOfLines={2} style={styles.detsText}>
                                bitrate:
                                {(item?.abr).toFixed(3)}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
        </View>
    );
};

const styles = StyleSheet.create({
    audioQualityContainer: {
        width: "100%",
        overflow: "hidden"
    },
    quality: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: vw * 0.03,
        width: "90%",
        marginHorizontal: "auto"
    },
    detsText: {
        color: "white",
        minWidth: "25%",
        fontSize: vw * 0.04,
        fontWeight: "bold",
        textAlign: "center"
    }
});

export default AudioQuality;
