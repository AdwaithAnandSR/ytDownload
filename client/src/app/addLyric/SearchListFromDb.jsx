import { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList
} from "react-native";
import { useGlobalSearchParams } from "expo-router";
import axios from "axios";
import Toast from "react-native-toast-message";
import Constants from "expo-constants";

let api = Constants.expoConfig.extra.adminApi;
// api = "http://localhost:5000";

const handleSearch = async (text, setData) => {
    try {
        const res = await axios.post(
            `${api}/admin/searchLyric`,
            {
                text
            }
        );
        if (res.data?.lyrics?.length == 0)
            Toast.show({
                type: "info",
                text1: "NOT FOUND!"
            });
        else setData(res?.data?.lyrics);
    } catch (error) {
        console.error(error.response);
    }
};

const handleAddLyric = async (item, songId, index) => {
    try {
        const res = await axios.post(
            `${api}/admin/addLyricsToSong`,
            {
                lyricsId: item._id,
                songId,
                lyricsIndex: index
            }
        );

        if (res.data?.success) {
            Toast.show({
                type: "success",
                text1: "lyrics uploaded"
            });
        } else
            Toast.show({
                type: "error",
                text1: "lyrics upload failed"
            });
    } catch (error) {
        console.error(error);
    }
};

const RenderItem = ({ item, songId }) => {
    if (item.lyrics2.length === 0 && item.lyrics.length === 0) return;

    return (
        <View
            onLongPress={() => handleAddLyric(item, songId)}
            style={styles.item}
        >
            <Text selectable style={styles.listTitle}>
                {item.title}
            </Text>
            <TouchableOpacity
                onLongPress={() => handleAddLyric(item, songId, 1)}
                style={styles.item}
            >
                <Text selectable style={styles.listTitle}>
                    {item.lyrics}
                </Text>
            </TouchableOpacity>
            {item.lyrics2.length > 0 && (
                <TouchableOpacity
                    onLongPress={() => handleAddLyric(item, songId, 2)}
                    style={styles.item}
                >
                    <Text selectable style={styles.listTitle}>
                        {item.lyrics2}
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const SearchListFromDb = () => {
    const { songId, title } = useGlobalSearchParams();
    const [text, setText] = useState("");
    const [data, setData] = useState([]);

    return (
        <View style={styles.container}>
            <Text selectable style={styles.title}>
                {title}
            </Text>

            <View style={styles.searchBar}>
                <TextInput
                    style={styles.input}
                    value={text}
                    onChangeText={txt => setText(txt)}
                    multiline
                />
                <TouchableOpacity
                    onPress={() => handleSearch(text, setData)}
                    style={styles.btn}
                >
                    <Text>Search</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={data}
                style={{ paddingBottom: 100 }}
                renderItem={({ item }) => (
                    <RenderItem item={item} songId={songId} />
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        backgroundColor: "black"
    },
    title: {
        color: "white",
        padding: 20,
        fontSize: 25,
        fontWeight: "bold"
    },
    searchBar: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 15,
        marginTop: 20
    },
    input: {
        width: "75%",
        padding: 15,
        borderRadius: 18,
        borderColor: "white",
        color: "white",
        borderWidth: 1,
        fontSize: 25,
        fontWeight: "bold",
    },
    btn: {
        padding: 10,
        borderRadius: 18,
        backgroundColor: "#eb0b4a",
        alignItems: "center",
        justifyContent: "center"
    },
    item: {
        width: "95%",
        marginHorizontal: "auto",
        marginVertical: 10,
        borderRadius: 18,
        borderColor: "white",
        borderWidth: 1,
        padding: 15,
        paddingBottom: 100
    },
    listTitle: {
        color: "white",
        textAlign: "center",
        margin: 10
    }
});

export default SearchListFromDb;
