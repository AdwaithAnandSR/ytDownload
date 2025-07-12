import { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput
} from "react-native";
import { Image } from "expo-image";

import {
    deleteSong,
    swapLyric,
    deleteLyric,
    updateArtist
} from "../../controllers/hanleManageSongs.js";

const RenderItem = ({ item }) => {
    const [artist, setArtist] = useState(
        item.artist.toLowerCase() != "unknown" ? item.artist : " "
    );

    useEffect(() => {
        setArtist(item.artist.toLowerCase() !== "unknown" ? item.artist : " ");
    }, [item.artist]);

    return (
        <View style={styles.listItem}>
            <Text selectable style={{ color: "#1f38a9" }}>
                {item._id}
            </Text>
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%"
                }}
            >
                <Image source={item.cover} style={{ width: 60, height: 60 }} />
                <Text selectable style={styles.title}>
                    {item.title}
                </Text>
            </View>
            <View style={styles.inner}>
                <View style={styles.left}>
                    {item?.lyrics?.slice(0, 10).map((item, index) => (
                        <Text
                            key={index}
                            numberOfLines={1}
                            adjustFontSizeToFit
                            style={styles.lyric}
                        >
                            {item.line}
                        </Text>
                    ))}
                    {item.lyrics?.length > 0 && (
                        <TouchableOpacity
                            onLongPress={() => deleteLyric(item._id, 1)}
                            style={styles.btn}
                        >
                            <Text style={styles.title}>DELETE LYRIC</Text>
                        </TouchableOpacity>
                    )}
                </View>
                <View style={styles.right}>
                    {item?.lyricsAsText?.slice(0, 10).map((item, index) => (
                        <Text
                            key={index}
                            numberOfLines={1}
                            adjustFontSizeToFit
                            style={styles.lyric}
                        >
                            {item}
                        </Text>
                    ))}
                    {item.lyricsAsText?.length > 0 && (
                        <TouchableOpacity
                            onLongPress={() => deleteLyric(item._id, 1)}
                            style={styles.btn}
                        >
                            <Text style={styles.title}>DELETE LYRIC</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <Text
                style={[
                    styles.title,
                    { color: item.synced ? "#87f0c2" : "white" }
                ]}
            >
                Is Synced: {item.synced ? "TRUE" : "FALSE"}
                {"\n"}artist: {item.artist}
            </Text>

            {item.lyricsAsText?.length > 0 && item.lyrics?.length > 0 && (
                <TouchableOpacity
                    onLongPress={() => swapLyric(item._id)}
                    style={[styles.btn, { backgroundColor: "#723b10" }]}
                >
                    <Text style={styles.title}>SWAP LYRIC</Text>
                </TouchableOpacity>
            )}

            <View style={styles.artist}>
                <TextInput
                    style={styles.input}
                    value={artist}
                    onChangeText={txt => setArtist(txt)}
                />
                <TouchableOpacity
                    onLongPress={() => updateArtist(item._id, artist.trim())}
                    style={[styles.btn, { backgroundColor: "#77e000" }]}
                >
                    <Text style={styles.title}>SAVE</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                onLongPress={() => deleteSong(item._id)}
                style={styles.btn}
            >
                <Text style={styles.title}>DELETE SONG</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    listItem: {
        width: "98%",
        height: 800,
        marginHorizontal: "auto",
        marginVertical: 10,
        borderRadius: 18,
        borderColor: "white",
        borderWidth: 1,
        padding: 15,
        paddingVetical: 50,
        overflow: "hidden"
    },
    inner: {
        width: "100%",
        overflow: "hidden",
        height: "50%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 15
    },
    left: {
        overflow: "hidden",
        width: "50%",
        alignItems: "center",
        
    },
    right: {
        
        overflow: "hidden",
        width: "50%",
        alignItems: "center"
    },
    lyric: {
        color: "white",
        width: "90%"
    },
    artist: {
        width: "100%",
        overflow: "hidden",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 10
    },
    title: {
        fontWeight: "bold",
        fontSize: 20,
        textAlign: "center",
        overflow: "hidden",
        color: "white",
        width: "75%"
    },
    input: {
        width: "70%",
        padding: 15,
        borderRadius: 18,
        borderColor: "white",
        color: "white",
        borderWidth: 1,
        fontSize: 17,
        fontWeight: "bold",
        backgroundColor: "#121212"
    },
    btn: {
        padding: 10,
        paddingHorizontal: 15,
        borderRadius: 18,
        backgroundColor: "#eb0b4a",
        alignItems: "center",
        justifyContent: "center",
        marginVertical: 10
    }
});

export default RenderItem;
