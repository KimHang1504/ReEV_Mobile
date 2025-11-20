import React, { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, Image, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Linking } from "react-native";

const PaymentSuccessScreen = () => {
    const navigation = useNavigation();
    const { params } = useRoute();
    const { order } = params || {};
    const [isSuccess, setIsSuccess] = useState(true);
    const [code, setCode] = useState(null);
    const [status, setStatus] = useState(null);

    // 🔹 Parse URL params helper
    const parseUrlParams = (url) => {
        const params = {};
        if (!url) return params;
        const queryString = url.split('?')[1];
        if (!queryString) return params;
        queryString.split('&').forEach(param => {
            const [key, value] = param.split('=');
            if (key && value) {
                params[decodeURIComponent(key)] = decodeURIComponent(value);
            }
        });
        return params;
    };

    // 🔹 Check code từ URL params (khi redirect từ PayOS)
    useEffect(() => {
        // Kiểm tra nếu có params từ deep link hoặc URL
        const checkPaymentStatus = async () => {
            try {
                // Lấy URL hiện tại nếu có
                const initialUrl = await Linking.getInitialURL();
                if (initialUrl) {
                    const params = parseUrlParams(initialUrl);
                    const codeParam = params.code;
                    const statusParam = params.status;
                    
                    if (codeParam) {
                        setCode(codeParam);
                        // code=00 means success
                        const success = codeParam === '00' || statusParam === 'success' || statusParam === 'paid';
                        setIsSuccess(success);
                        setStatus(statusParam);
                        
                        if (!success) {
                            Alert.alert(
                                'Thanh toán thất bại',
                                `Code: ${codeParam}, Status: ${statusParam || 'unknown'}`,
                                [{ text: 'OK', onPress: () => navigation.goBack() }]
                            );
                        }
                    }
                }
            } catch (err) {
                console.error('Error checking payment status:', err);
            }
        };

        checkPaymentStatus();

        // Listen for URL changes
        const subscription = Linking.addEventListener('url', ({ url }) => {
            try {
                const params = parseUrlParams(url);
                const codeParam = params.code;
                const statusParam = params.status;
                
                if (codeParam) {
                    setCode(codeParam);
                    const success = codeParam === '00' || statusParam === 'success' || statusParam === 'paid';
                    setIsSuccess(success);
                    setStatus(statusParam);
                    
                    if (!success) {
                        Alert.alert(
                            'Thanh toán thất bại',
                            `Code: ${codeParam}, Status: ${statusParam || 'unknown'}`,
                            [{ text: 'OK', onPress: () => navigation.goBack() }]
                        );
                    }
                }
            } catch (err) {
                console.error('Error parsing URL:', err);
            }
        });

        return () => {
            subscription.remove();
        };
    }, [navigation]);

    // 🔹 Nếu không thành công, hiển thị error
    if (!isSuccess) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.iconBox}>
                    <Ionicons name="close-circle" size={80} color="#E53935" />
                    <Text style={[styles.title, { color: '#E53935' }]}>Thanh toán thất bại!</Text>
                    <Text style={styles.sub}>
                        Code: {code || 'Unknown'}, Status: {status || 'Unknown'}
                    </Text>
                </View>
                <Pressable
                    style={styles.homeBtn}
                    onPress={() => navigation.replace("MainTabs")}
                >
                    <Ionicons name="home-outline" size={22} color="#007AFF" />
                    <Text style={styles.homeText}>Quay lại Trang chủ</Text>
                </Pressable>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.iconBox}>
                <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
                <Text style={styles.title}>Thanh toán thành công!</Text>
                <Text style={styles.sub}>
                    Cảm ơn bạn đã mua hàng cùng ReEV Marketplace ⚡
                </Text>
            </View>

            <View style={styles.box}>
                <Text style={styles.label}>Mã đơn hàng:</Text>
                <Text style={styles.value}>{order?.orderId || "Không có"}</Text>

                <Text style={styles.label}>Sản phẩm:</Text>
                <Text style={styles.value}>{order?.product?.title || "Không có"}</Text>

                <Text style={styles.label}>Tổng thanh toán:</Text>
                <Text style={[styles.value, { color: "#E53935", fontSize: 18 }]}>
                    {Number(order?.grandTotal || 0).toLocaleString()} ₫
                </Text>

                <Text style={styles.label}>Phương thức:</Text>
                <Text style={styles.value}>{order?.method === "wallet" ? "Ví điện tử" : "PayOS"}</Text>
            </View>

            <Pressable
                style={styles.detailBtn}
                onPress={() => navigation.replace("OrderDetail", { order })}
            >
                <Ionicons name="receipt-outline" size={22} color="#fff" />
                <Text style={styles.detailText}>Xem chi tiết đơn hàng</Text>
            </Pressable>

            <Pressable
                style={styles.homeBtn}
                onPress={() => navigation.replace("MainTabs")}
            >
                <Ionicons name="home-outline" size={22} color="#007AFF" />
                <Text style={styles.homeText}>Quay lại Trang chủ</Text>
            </Pressable>
        </SafeAreaView>
    );
};

export default PaymentSuccessScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F8F9FB", padding: 20 },
    iconBox: { alignItems: "center", marginTop: 60, marginBottom: 30 },
    title: { fontSize: 24, fontWeight: "700", color: "#333", marginTop: 10 },
    sub: { color: "#777", fontSize: 14, textAlign: "center", marginTop: 4 },
    box: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        marginVertical: 20,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 1 },
        elevation: 1,
    },
    label: { color: "#666", marginTop: 8 },
    value: { color: "#222", fontWeight: "600" },
    detailBtn: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#007AFF",
        paddingVertical: 14,
        borderRadius: 10,
    },
    detailText: { color: "#fff", fontSize: 16, fontWeight: "600", marginLeft: 8 },
    homeBtn: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 16,
    },
    homeText: { color: "#007AFF", fontWeight: "600", fontSize: 15, marginLeft: 6 },
});
