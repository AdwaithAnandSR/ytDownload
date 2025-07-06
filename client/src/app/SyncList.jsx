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
import Constants from "expo-constants";

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
    const [page, setPage] = useState("1");
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
                <TouchableOpacity
                    style={styles.btn}
                    onPress={() => getSongs(page, 15, setData)}
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
    listItem: {
        width: "95%",
        marginHorizontal: "auto",
        marginVertical: 10,
        borderRadius: 18,
        borderColor: "white",
        borderWidth: 1,
        padding: 15,
        paddingVetical: 50
    },
    title: {
        fontWeight: "bold",
        fontSize: 15,
        textAlign: "center",
        color: "white"
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
        justifyContent: "center"
    }
});

export default Sync;
