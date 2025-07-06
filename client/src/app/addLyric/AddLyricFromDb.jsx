import { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList
} from "react-native";
import { router } from "expo-router";
import axios from "axios";
import Constants from "expo-constants";

let api = Constants.expoConfig.extra.api;

const handleSearch = async (page, setData) => {
    try {
        const res = await axios.post(
            `${api}/admin/getRemainingSongsWithoutLyric`,
            {
                limit: 10,
                page
            }
        );
        setData(res?.data?.songs);
    } catch (error) {
        console.error(error.response);
    }
};

const RenderItem = ({ item }) => (
    <TouchableOpacity
        onPress={() =>
            router.push({
                pathname: "addLyric/SearchListFromDb",
                params: { title: item.title, songId: item._id }
            })
        }
        style={styles.listItem}
    >
        <Text style={styles.title}>{item.title}</Text>
    </TouchableOpacity>
);

const AddLyricToDb = () => {
    const [page, setPage] = useState("1");
    const [data, setData] = useState([]);

    return (
        <View style={styles.container}>
            <View style={styles.nav}>
                <TextInput
                    style={styles.input}
                    value={page}
                    onChangeText={txt => setPage(txt)}
                />
                <TouchableOpacity
                    onPress={() => handleSearch(page, setData)}
                    style={styles.btn}
                >
                    <Text>Search</Text>
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
        alignItems: "center",
        backgroundColor: "black"
    },
    nav: {
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
        fontSize: 18,
        fontWeight: "bold"
    },
    btn: {
        padding: 10,
        borderRadius: 18,
        backgroundColor: "#eb0b4a",
        alignItems: "center",
        justifyContent: "center"
    },
    listItem: {
        width: "98%",
        height: 75,
        marginHorizontal: "auto",
        borderRadius: 25,
        backgroundColor: "#1b1b1b",
        marginVertical: 10,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 15
    },
    title: {
        color: "white"
    }
});

export default AddLyricToDb;
