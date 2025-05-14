import { Stack } from "expo-router";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { StateProvider } from "../contexts/state.context.js";

export default function RootLayout() {
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "black" }}>
            <StateProvider>
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="index" />
                    <Stack.Screen
                        name="Queue"
                        options={{
                            animation: "slide_from_right"
                        }}
                    />
                </Stack>
            </StateProvider>
        </SafeAreaView>
    );
}
