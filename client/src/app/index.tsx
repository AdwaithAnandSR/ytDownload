import React, { useRef, useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    BackHandler
} from "react-native";
import { WebView } from "react-native-webview";
import { router } from "expo-router";

import FloatingBtn from "../components/FloatingDownloadBtn.jsx";
import BottomStripe from "../components/stripe/StripeContainer.jsx";

import handleDownload from "../controllers/downloadViaUrl.js";
import useGetInfo from "../hooks/useGetInfo.js";

import { useAppState } from "../contexts/state.context.js";

export default function App() {
    const webviewRef = useRef(null);
    const [currentUrl, setCurrentUrl] = useState("");
    const [isStripeVisible, setIsStripeVisible] = useState(false);

    const [canGoBack, setCanGoBack] = useState(false);

    useGetInfo({ url: currentUrl });

    useEffect(() => {
        const backAction = () => {
            if (canGoBack) {
                webviewRef.current.goBack();
                return true; // prevent default behavior (exit app)
            }
            return false; // allow default behavior (exit app)
        };

        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            backAction
        );

        return () => backHandler.remove();
    }, [canGoBack]);

    const handleGetUrl = () => {
        if (webviewRef.current) {
            webviewRef.current.injectJavaScript(`
        window.ReactNativeWebView.postMessage(window.location.href);
        true;
      `);
        }
    };

    const handleMessage = event => {
        const url = event.nativeEvent.data;
        setCurrentUrl(url);
    };

    const handleDownloadBtnClick = () => {
        setIsStripeVisible(true);
        handleGetUrl();
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

            <FloatingBtn handlePress={handleDownloadBtnClick} />

            {isStripeVisible && (
                <BottomStripe setIsStripeVisible={setIsStripeVisible} />
            )}
        </View>
    );
}

const styles = StyleSheet.create({});
