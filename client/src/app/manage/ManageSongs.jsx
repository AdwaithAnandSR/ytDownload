import { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    ScrollView
} from "react-native";
import axios from "axios";
import { router } from "expo-router";
import Constants from "expo-constants";

import {
    deleteSong,
    swapLyric,
    deleteLyric,
    updateArtist
} from "../../controllers/hanleManageSongs.js";

let api = Constants.expoConfig.extra.adminApi;
// api = "http://localhost:5000";

const getSongs = async (page, limit, setData) => {
    try {
        if (page != "" && !isNaN(page)) {
            const res = await axios.post(`${api}/admin/getSongsToBeSynced`, {
                page,
                limit
            });
            setData(res.data.songs);
        } else {
            const res = await axios.post(`${api}/admin/searchSong`, {
                text: page
            });
            setData(res?.data?.songs);
        }
    } catch (error) {
        console.error(error);
    }
};

const RenderItem = ({ item }) => {
    const [artist, setArtist] = useState(item.artist);

    return (
        <View style={styles.listItem}>
            <Text selectable style={styles.title}>
                {item.title}
            </Text>
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
                    onLongPress={() => updateArtist(item._id, artist)}
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

const ManageSongs = () => {
    const [page, setPage] = useState("1");
    const [data, setData] = useState([]);

    useEffect(() => {
        getSongs(page, 10, setData);
    }, []);

    return (
        <View style={styles.container}>
            <View style={{ flexDirection: "row", gap: 20 }}>
                <TextInput
                    style={styles.input}
                    value={page}
                    onChangeText={txt => setPage(txt)}
                />
                <TouchableOpacity
                    style={styles.btn}
                    onPress={() => getSongs(page, 10, setData)}
                >
                    <Text style={styles.title}>find</Text>
                </TouchableOpacity>
            </View>
            <FlatList
                data={data}
                contentContainerStyle={{ paddingVertical: 50 }}
                renderItem={({ item }) => <RenderItem item={item} />}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "black"
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
    },
    listItem: {
        width: "98%",
        height: 650,
        marginHorizontal: "auto",
        marginVertical: 10,
        borderRadius: 18,
        borderColor: "white",
        borderWidth: 1,
        padding: 15,
        paddingVetical: 50,
        overflow: "hidden"
    },
    title: {
        fontWeight: "bold",
        fontSize: 20,
        textAlign: "center",
        overflow: "hidden",
        color: "white"
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
        height: "90%"
    },
    right: {
        height: "90%",
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
    }
});

export default ManageSongs;
