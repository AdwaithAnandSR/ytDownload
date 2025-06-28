import { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ScrollView
} from "react-native";
import { useGlobalSearchParams } from "expo-router";
import { router } from "expo-router";
import axios from "axios";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";

import RenderItem from "../components/Sync/LyricItem.jsx";
import Nav from "../components/Sync/Nav.jsx";
import Result from "../components/Sync/Result.jsx";

const getDets = async (id, setData) => {
    try {
        const res = await axios.post(
            "http://localhost:5000/lyrics/getSongById",
            { id }
        );
        setData(res.data.song);
    } catch (error) {
        console.error(error);
    }
};

const Sync = () => {
    const { id } = useGlobalSearchParams();
    const [data, setData] = useState({});
    const [showSync, setShowSync] = useState(false);

    const syncedLyricRef = useRef([]);

    const player = useAudioPlayer(data?.url);

    useEffect(() => {
        if (id) getDets(id, setData);
    }, [id]);

    useEffect(() => {
        if (!data?.lyricsAsText1) return;

        syncedLyricRef.current = data.lyricsAsText1.map(line => ({
            start: -1,
            line,
            end: -1
        }));
    }, [data]);

    return (
        <View style={styles.container}>
            <Nav player={player} id={id} syncedLyricRef={syncedLyricRef} setShowSync={setShowSync} />

            <FlatList
                data={data.lyricsAsText1}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => (
                    <RenderItem
                        item={item}
                        index={index}
                        player={player}
                        syncedLyricRef={syncedLyricRef}
                    />
                )}
            />
            {showSync && <Result syncedLyricRef={syncedLyricRef} />}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 40,
        alignItems: "center",
        backgroundColor: "#fff"
    },
    header: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 10
    },
    controlRow: {
        padding: 15,
        flexDirection: "row",
        gap: 30,
        justifyContent: "center",
        alignItems: "center"
    },
    listItem: {
        width: "100%",
        padding: 15,
        borderBottomWidth: 1,
        borderColor: "#ccc"
    },
    title: {
        fontWeight: "bold",
        fontSize: 18,
        textAlign: "center",
        marginBottom: 10
    },
    btn: {
        padding: 10,
        borderWidth: 2,
        borderRadius: 23,
        marginHorizontal: 5
    },
    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 30
    }
});

export default Sync;
