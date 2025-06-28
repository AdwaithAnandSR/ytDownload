import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import axios from "axios";

const Nav = ({ player, syncedLyricRef, setShowSync, id}) => {
    const show = () => {
        syncedLyricRef.current.map((item, index) => {
            if (item.end === -1)
                item.end = syncedLyricRef.current[index + 1]?.start;
        });

        setShowSync(prev => !prev);
    };

    return (
        <>
            <Text style={styles.header}>Sync</Text>
            <View style={styles.controlRow}>
                <TouchableOpacity
                    onPress={() =>
                        player.seekTo(Math.max(0, player.currentTime - 5))
                    }
                >
                    <Text style={styles.text}>-5</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => player.play()}>
                    <Text style={styles.text}>+5</Text>
                </TouchableOpacity>
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
                        try {
                            const res = await axios.post(
                                "http://localhost:5000/lyrics/setSyncedSong",
                                {
                                    id,
                                    syncedLyric: syncedLyricRef.current,
                                    duration: player.duration
                                }
                            );

                            alert(res.data.success);
                        } catch (error) {
                            console.error(error);
                        }
                    }}
                >
                    <Text style={styles.text}>upload</Text>
                </TouchableOpacity>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
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
    text: {
        fontSize: 18,
        fontWeight: "bold"
    }
});

export default Nav;
