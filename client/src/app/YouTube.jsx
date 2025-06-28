import React, { useRef, useState, useEffect, useCallback } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    BackHandler
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { WebView } from "react-native-webview";
import { router } from "expo-router";
import { useAudioPlayer } from "expo-audio";

import FloatingBtn from "../components/FloatingDownloadBtn.jsx";
import BottomStripe from "../components/stripe/StripeContainer.jsx";

import useGetInfo from "../hooks/useGetInfo.js";

export default function App() {
    const webviewRef = useRef(null);
    const pendingUrlResolver = useRef(null);
    const [isStripeVisible, setIsStripeVisible] = useState(false);
    const [canGoBack, setCanGoBack] = useState(false);

    useFocusEffect(
        useCallback(() => {
            const backAction = () => {
                if (canGoBack) {
                    webviewRef.current.goBack();
                    return true;
                }
                return false;
            };

            const backHandler = BackHandler.addEventListener(
                "hardwareBackPress",
                backAction
            );

            return () => backHandler.remove();
        }, [canGoBack])
    );

    const handleGetUrl = () => {
        return new Promise(resolve => {
            pendingUrlResolver.current = resolve;
            webviewRef.current?.injectJavaScript(`
      window.ReactNativeWebView.postMessage(window.location.href);
      true;
    `);
        });
    };

    const handleMessage = event => {
        const url = event.nativeEvent.data;
        if (pendingUrlResolver.current) {
            pendingUrlResolver.current(url);
            pendingUrlResolver.current = null; // Clear the resolver
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <WebView
                ref={webviewRef}
                source={{ uri: "https://m.youtube.com" }}
                onMessage={handleMessage}
                javaScriptEnabled={true}
                style={{ flex: 1 }}
                onNavigationStateChange={navState => {
                    setCanGoBack(navState.canGoBack);
                }}
            />

            <FloatingBtn
                setIsStripeVisible={setIsStripeVisible}
                handleGetUrl={handleGetUrl}
            />

            {isStripeVisible && (
                <BottomStripe setIsStripeVisible={setIsStripeVisible} />
            )}
        </View>
    );
}

const styles = StyleSheet.create({});
