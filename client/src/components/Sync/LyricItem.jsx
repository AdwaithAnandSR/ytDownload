import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

const RenderItem = ({ item, index, player, syncedLyricRef, showL2 }) => {
    const setStart = () => {
        syncedLyricRef.current[index].start = player.currentTime;
        console.log(`Set start for line ${index} at ${player.currentTime}`);
    };

    const setEnd = () => {
        syncedLyricRef.current[index].end = player.currentTime;
        console.log(`Set end for line ${index} at ${player.currentTime}`);
    };

    return (
        <TouchableOpacity style={styles.listItem}>
            <Text style={styles.txt}>{showL2 ? item : item?.line}</Text>
            <View style={styles.buttonRow}>
                <TouchableOpacity onPress={setStart} style={styles.btn}>
                    <Text style={styles.txt}>START</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={setEnd} style={styles.btn}>
                    <Text style={styles.txt}>END</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    listItem: {
        width: "100%",
        padding: 15,
        borderBottomWidth: 1,
        borderColor: "#ccc"
    },
    txt: {
        fontWeight: "bold",
        fontSize: 18,
        textAlign: "center",
        color: "white"
    },
    btn: {
        marginTop: 10,
        padding: 10,
        borderWidth: 2,
        borderRadius: 23,
        marginHorizontal: 5,
        borderColor: '#a7a7a7',
    },
    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 30
    }
});

export default RenderItem;
