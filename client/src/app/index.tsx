import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";

export default function App() {
    return (
        <View style={styles.container}>
            <TouchableOpacity
                onPress={() => router.push("YouTube")}
                style={styles.button}
            >
                <Text style={styles.text}>Save To Cloud</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.button}
                onPress={() => router.push("SyncList")}
            >
                <Text style={styles.text}>Sync</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.button}
                onPress={() => router.push("addLyric/AddLyricToSong")}
            >
                <Text style={styles.text}>Add Lyric From Text</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.button}
                onPress={() => router.push("addLyric/AddLyricFromDb")}
            >
                <Text style={styles.text}>Add Lyric From DB</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.button}
                onPress={() => router.push("manage/ManageSongs")}
            >
                <Text style={styles.text}>Manage Songs</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "black",
        padding: 10
    },
    button: {
        padding: 20,
        backgroundColor: "#19f696",
        borderRadius: 25,
        marginVertical: 10
    },
    text: {
        textAlign: "center",
        fontSize: 20,
        fontWeight: "bold"
    }
});
