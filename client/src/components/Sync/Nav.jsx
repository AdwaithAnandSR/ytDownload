import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import axios from "axios";
import Toast from "react-native-toast-message";
import Constants from "expo-constants";

let api = Constants.expoConfig.extra.adminApi;
// api = "http://localhost:5000";

const setLyric = async (id, syncedLyricRef, duration) => {
    try {
        const res = await axios.post(`${api}/admin/setSyncedSong`, {
            id,
            syncedLyric: syncedLyricRef.current,
            duration: duration
        });

        if (res.data?.success)
            Toast.show({
                type: "success",
                text1: "Lyric Added Succesfull"
            });
        else
            Toast.show({
                type: "error",
                text1: "Lyric Added failed"
            });
    } catch (error) {
        console.error(error);
        Toast.show({
            type: "error",
            text1: "Lyric Added failed",
            text2: error?.message || "Lyric Added failed"
        });
    }
};

const remove = async (id, setShowL2) => {
    try {
        let index = -1;
        setShowL2(prev => {
            if (prev) index = 2;
            else index = 1;
            return prev;
        });

        if (index != -1) {
            const res = await axios.post(`${api}/admin/removeLyric`, {
                id,
                index
            });

            alert(res?.data?.success);
        }
    } catch (error) {
        console.error(error);
    }
};

const Nav = ({ player, syncedLyricRef, setShowSync, id, setShowL2 }) => {
    const show = () => {
        syncedLyricRef.current.map((item, index) => {
            if (item.end === -1)
                item.end = syncedLyricRef.current[index + 1]?.start;
        });

        setShowSync(prev => !prev);
    };

    return (
        <>
            <View style={styles.controlRow}>
                <View style={styles.left}>
                    <TouchableOpacity onLongPress={() => setShowL2(prev => !prev)}>
                        <Text style={styles.text}>toggle</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() =>
                            player.seekTo(Math.max(0, player.currentTime - 5))
                        }
                    >
                        <Text style={styles.text}>-5</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() =>
                            player.seekTo(
                                Math.min(
                                    player.duration,
                                    player.currentTime + 5
                                )
                            )
                        }
                    >
                        <Text style={styles.text}>+5</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onLongPress={() => remove(id, setShowL2)}>
                        <Text style={[styles.text, { color: "red" }]}>
                            REMOVE
                        </Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.right}>
                    <TouchableOpacity onPress={() => player.play()}>
                        <Text style={styles.text}>Start</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => player.pause()}>
                        <Text style={styles.text}>Stop</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={show}>
                        <Text style={styles.text}>Show</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onLongPress={async () => {
                            setLyric(id, syncedLyricRef, player.duration);
                        }}
                    >
                        <Text style={styles.text}>upload</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    header: {
        fontSize: 24,
        fontWeight: "bold",
        color: "white",
        marginBottom: -10
    },
    controlRow: {
        padding: 15,
        justifyContent: "center",
        alignItems: "center",
        gap: 20,
        marginTop: -20,
        paddingBottom: 25
    },
    right: {
        justifyContent: "space-between",
        alignItems: "center",
        gap: 30,
        flexDirection: "row"
    },
    left: {
        gap: 40,
        flexDirection: "row"
    },
    text: {
        fontSize: 18,
        fontWeight: "bold",
        color: "white"
    }
});

export default Nav;
