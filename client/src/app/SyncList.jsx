import { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput
} from "react-native";
import axios from "axios";
import { router } from "expo-router";

const getSongs = async (page, limit, setData) => {
    try {
        const res = await axios.post(
            "http://localhost:5000/lyrics/getUnSyncedLyrics",
            { page, limit }
        );
        setData(res.data.songs);
    } catch (error) {
        console.error(error);
    }
};

const RenderItem = ({ item }) => {
    return (
        <TouchableOpacity
            onPress={() =>
                router.push({ pathname: "Sync", params: { id: item._id } })
            }
            style={styles.listItem}
        >
            <Text style={styles.title}>{item.title}</Text>
        </TouchableOpacity>
    );
};

const Sync = () => {
    const [page, setPage] = useState(1);
    const [data, setData] = useState([]);

    useEffect(() => {
        getSongs(page, 15, setData);
    }, []);

    return (
        <View style={styles.container}>
            <View style={{ flexDirection: "row", gap: 20 }}>
                <TextInput
                    style={styles.input}
                    value={page}
                    onChangeText={txt => setPage(txt)}
                />
                <TouchableOpacity onPress={() => getSongs(page, 15, setData)}>
                    <Text style={styles.title}>find</Text>
                </TouchableOpacity>
            </View>
            <FlatList
                data={data}
                renderItem={({ item }) => <RenderItem item={item} />}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    listItem: {
        width: "100%",
        height: 70,
        paddingHorizontal: 15,
        justifyContent: "center"
    },
    title: {
        fontWeight: "bold",
        fontSize: 20,
        textAlign: "center"
    },
    input: {
        padding: 10,
        borderColor: "black",
        borderWidth: 2,
        width: 200
    }
});

export default Sync;
