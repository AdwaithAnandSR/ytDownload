import { Stack } from "expo-router";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from 'react-native-toast-message';

import { StateProvider } from "../contexts/state.context.js";
import toastConfig from "../config/toast.config.js"

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
                <Toast config={toastConfig} />
            </StateProvider>
        </SafeAreaView>
    );
}
