import React from "react";
import { View, Text, Pressable, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

const PaymentSuccessScreen = () => {
    const navigation = useNavigation();
    const { params } = useRoute();
    const { order } = params || {};

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
