import { useEffect, useRef } from "react";
import {
    View,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    Animated,
    PanResponder,
    BackHandler,
    ScrollView
} from "react-native";

import StripeBody from "./StripeBody.jsx";
import { useAppState } from "../../contexts/state.context.js";

const { width: vw, height: vh } = Dimensions.get("window");

const DownloadDetailsStripe = ({ setIsStripeVisible }) => {
    const translateY = useRef(new Animated.Value(vh * 0.6)).current;
    const opacityVal = useRef(new Animated.Value(1)).current;
    const { downloadQueue } = useAppState();

    useEffect(() => {
        Animated.timing(translateY, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true
        }).start();

        const backAction = () => {
            Animated.timing(translateY, {
                toValue: vh * 0.6,
                duration: 400,
                useNativeDriver: true
            }).start(() => {
                setIsStripeVisible(false);
            });
            return true;
        };

        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            backAction
        );

        return () => backHandler.remove();
    }, []);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderGrant: (evt, gestureState) => {
                Animated.timing(opacityVal, {
                    toValue: 0.3,
                    duration: 100,
                    useNativeDriver: true
                }).start();
            },
            onPanResponderMove: (evt, gestureState) => {
                if (gestureState.moveY < vh * 0.4) return;
                translateY.setValue(gestureState.moveY - vh * 0.4);
            },
            onPanResponderRelease: (evt, gestureState) => {
                if (gestureState.moveY > vh - 150) {
                    Animated.timing(translateY, {
                        toValue: vh * 0.6,
                        duration: 200,
                        useNativeDriver: true
                    }).start();
                    return setIsStripeVisible(false);
                }

                Animated.parallel([
                    Animated.timing(opacityVal, {
                        toValue: 1,
                        duration: 100,
                        useNativeDriver: true
                    }),
                    Animated.timing(translateY, {
                        toValue: 0,
                        duration: 400,
                        useNativeDriver: true
                    })
                ]).start();
            }
        })
    ).current;

    return (
        <Animated.View
            style={[styles.container, { transform: [{ translateY }] }]}
        >
            {/* stripe movement trigger */}
            <Animated.View
                {...panResponder.panHandlers}
                style={[styles.backBtnConatainer, { opacity: opacityVal }]}
            >
                <View style={styles.backBtn} />
            </Animated.View>

            {/* stripe body */}

            <ScrollView style={styles.scrollView}>
                {downloadQueue?.map((item, index) => (
                    <StripeBody item={item} key={index} />
                ))}
            </ScrollView>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: "100%",
        height: vh * 0.6,
        position: "absolute",
        bottom: 0,
        backgroundColor: "#101010eb",
        borderTopRightRadius: vw * 0.1,
        borderTopLeftRadius: vw * 0.1,
        overflow: "hidden"
    },
    backBtnConatainer: {
        width: "100%",
        height: vh * 0.035,
        justifyContent: "center",
        alignItems: "center"
    },
    backBtn: {
        width: "20%",
        height: "10%",
        borderRadius: vw * 0.1,
        backgroundColor: "white"
    },
    
    text: {
        color: "white",
        textAlign: "center",
        marginVertical: vh * 0.02,
        fontWeight: "bold"
    }
});

export default DownloadDetailsStripe;
