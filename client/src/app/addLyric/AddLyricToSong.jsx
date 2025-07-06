import { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    ScrollView
} from "react-native";
import axios from "axios";
import Constants from "expo-constants";

let api = Constants.expoConfig.extra.api;

const handleSearch = async (text, setData) => {
    try {
        if (text.trim() != "" && !isNaN(text.trim())) {
            const res = await axios.post(
                `${api}/admin/getRemainingSongsWithoutLyric`,
                {
                    limit: 10,
                    page: text
                }
            );
            setData(res?.data?.songs);
        } else {
            const res = await axios.post(`${api}/admin/searchSong`, {
                text
            });
            setData(res?.data?.songs);
        }
    } catch (error) {
        console.error(error.response);
    }
};

const handleAddLyric = async (lyricText, artist, item) => {
    let lyric = lyricText.split("\n").filter(line => line.trim() !== "");

    const res = await axios.post(`${api}/admin/addLyricsDirectToSong`, {
        lyric,
        songId: item._id,
        artist
    });

    alert(res.data.success);
};

const RenderItem = ({ item, setSelectedItem }) => (
    <TouchableOpacity
        style={styles.listItem}
        onPress={() => setSelectedItem(item)}
    >
        <Text>{item.title}</Text>
    </TouchableOpacity>
);

const AddLyricToSong = () => {
    const [text, setText] = useState("");
    const [data, setData] = useState([]);
    const [lyricText, setLyricText] = useState("");
    const [artist, setArtist] = useState("Unknown");
    const [selectedItem, setSelectedItem] = useState({});

    return (
        <View style={styles.container}>
            <TextInput
                value={text}
                onChangeText={txt => setText(txt)}
                style={styles.input}
            />
            <TouchableOpacity
                onPress={() => handleSearch(text, setData)}
                style={styles.btn}
            >
                <Text>Search</Text>
            </TouchableOpacity>

            <FlatList
                data={data}
                renderItem={({ item }) => RenderItem({ item, setSelectedItem })}
            />

            {selectedItem?._id && (
                <View style={styles.lyricAddPage}>
                    <TouchableOpacity onPress={() => setSelectedItem()}>
                        <Text style={styles.close}>CLOSE</Text>
                    </TouchableOpacity>
                    <Text selectable>Title: {selectedItem.title}</Text>
                    <TextInput
                        value={artist}
                        onChangeText={txt => setArtist(txt)}
                        style={styles.input}
                    />
                    <TextInput
                        value={lyricText}
                        autoCorrect={false}
                        spellcheck={false}
                        multiline
                        onChangeText={txt => setLyricText(txt)}
                        style={styles.lyricsInput}
                    />
                    <TouchableOpacity
                        onPress={() =>
                            handleAddLyric(lyricText, artist, selectedItem)
                        }
                        style={styles.btn}
                    >
                        <Text>Add Lyric</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        backgroundColor: "black",
        paddingTop: 50
    },
    input: {
        width: 350,
        padding: 15,
        borderRadius: 18,
        borderColor: "white",
        color: "white",
        borderWidth: 2,
        fontSize: 18,
        fontWeight: "bold",
        marginHorizontal: "auto",
        marginTop: 15
    },
    btn: {
        padding: 10,
        borderRadius: 18,
        backgroundColor: "#eb0b4a",
        marginVertical: 10,
        alignItems: "center",
        justifyContent: "center"
    },
    listItem: {
        padding: 20,
        backgroundColor: "#08eaa1",
        borderRadius: 18,
        margin: 10
    },
    lyricAddPage: {
        width: "95%",
        height: "75%",
        backgroundColor: "#488700",
        borderRadius: 18,
        position: "absolute",
        left: "50%",
        top: "15%",
        transform: [{ translateX: "-50%" }],
        padding: 15,
        paddingBottom: 100
    },
    close: {
        fontSize: 23,
        fontWeight: "bold",
        padding: 10,
        color: "#f13c0e"
    },
    lyricsInput: {
        width: 350,
        maxHeight: 300,
        padding: 15,
        borderRadius: 18,
        borderColor: "white",
        color: "white",
        borderWidth: 2,
        fontSize: 18,
        fontWeight: "bold",
        marginVertical: 20,
        marginHorizontal: "auto",
        lineHeight: 40
    }
});

export default AddLyricToSong;
