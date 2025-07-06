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
import { useAudioPlayer } from "expo-audio";
import Constants from "expo-constants";

import RenderItem from "../components/Sync/LyricItem.jsx";
import Nav from "../components/Sync/Nav.jsx";
import Result from "../components/Sync/Result.jsx";

let api = Constants.expoConfig.extra.adminApi;
// api = "http://localhost:5000";

const getDets = async (id, setData) => {
    try {
        const res = await axios.post(`${api}/admin/getSongById`, { id });
        setData(res.data.song);
    } catch (error) {
        console.error(error);
    }
};

const Sync = () => {
    const { id } = useGlobalSearchParams();
    const [data, setData] = useState({});
    const [showSync, setShowSync] = useState(false);
    const [showL2, setShowL2] = useState(false);

    const syncedLyricRef = useRef([]);

    const player = useAudioPlayer(data?.url);

    useEffect(() => {
        if (id) getDets(id, setData);
    }, [id]);

    useEffect(() => {
        if (!data) return;

        if (showL2) {
            syncedLyricRef.current = data?.lyricsAsText?.map(line => ({
                start: -1,
                line,
                end: -1
            }));
        } else {
            syncedLyricRef.current = data?.lyrics
        }
    }, [data, showL2]);

    return (
        <View style={styles.container}>
            <Nav
                player={player}
                id={id}
                syncedLyricRef={syncedLyricRef}
                setShowSync={setShowSync}
                setShowL2={setShowL2}
            />

            <FlatList
                data={showL2 ? data.lyricsAsText : data.lyrics}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => (
                    <RenderItem
                        item={item}
                        showL2={showL2}
                        index={index}
                        player={player}
                        syncedLyricRef={syncedLyricRef}
                    />
                )}
            />
            {showSync && (
                <Result showL2={showL2} syncedLyricRef={syncedLyricRef} />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 40,
        alignItems: "center",
        backgroundColor: "black"
    }
});

export default Sync;
