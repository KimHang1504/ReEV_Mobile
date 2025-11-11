import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { orderService } from "../services/orderService";

const fmt = (n) => Number(n || 0).toLocaleString("vi-VN") + " ₫";

const OrderDetailScreen = () => {
  const { params } = useRoute();
  const orderIdParam = params?.orderId;
  const orderParam   = params?.order || null;

  const [detail, setDetail] = useState(orderParam);
  const [loading, setLoading] = useState(!orderParam);

  // Nếu không truyền full object thì fetch theo orderId
  useEffect(() => {
    const run = async () => {
      if (!orderIdParam || orderParam) return;
      try {
        setLoading(true);
        const data = await orderService.getOrderById(orderIdParam);
        setDetail(data);
      } catch (e) {
        console.error("❌ Fetch order detail error:", e);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [orderIdParam, orderParam]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Đang tải chi tiết đơn hàng...</Text>
      </View>
    );
  }

  if (!detail) {
    return (
      <View style={styles.centered}>
        <Text>Không tìm thấy thông tin đơn hàng.</Text>
      </View>
    );
  }

  // --- Quan trọng: bóc đúng nhánh ở trong orderShops[0] ---
  const shop    = detail.orderShops?.[0] || {};
  const firstOd = shop.orderDetails?.[0] || {};
  const product = firstOd.product || {};
  const seller  = shop.seller || {};
  const addr    = seller.defaultAddress || {};

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.title}>Chi tiết đơn hàng</Text>

        <View style={styles.box}>
          <Row label="Mã đơn hàng" value={detail.orderId} />
          <Row
            label="Trạng thái"
            value={detail.status || "PENDING"}
            valueStyle={{ color: detail.status === "PENDING" ? "#FF9800" : "#4CAF50" }}
          />
          <Row
            label="Ngày tạo"
            value={new Date(detail.createdAt).toLocaleString("vi-VN")}
          />
        </View>

        <View style={styles.box}>
          <Row label="Sản phẩm" value={product.title || "—"} />
          <Image
            source={{ uri: product.imageUrls?.[0] || "https://via.placeholder.com/150" }}
            style={styles.image}
          />
          <Row label="Giá sản phẩm" value={fmt(detail.totalPrice)} />
          <Row label="Phí vận chuyển" value={fmt(shop.shippingFee ?? detail.totalShippingFee)} />
          <Row
            label="Tổng thanh toán"
            value={fmt(detail.grandTotal)}
            valueStyle={{ color: "#E53935", fontSize: 18 }}
          />
        </View>

        {/* <View className="box" style={styles.box}>
          <Row label="Người bán" value={seller.fullName || "—"} />
          <Row label="Địa chỉ"   value={seller.line1 || "—"} />
          <Row label="Điện thoại" value={seller.phone || "—"} />
        </View> */}
      </ScrollView>
    </SafeAreaView>
  );
};

const Row = ({ label, value, valueStyle }) => (
  <>
    <Text style={styles.label}>{label}:</Text>
    <Text style={[styles.value, valueStyle]}>{value}</Text>
  </>
);

export default OrderDetailScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8F9FB" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 16, textAlign: "center" },
  box: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  label: { color: "#666", marginTop: 8 },
  value: { color: "#222", fontWeight: "600", marginTop: 4 },
  image: { width: "100%", height: 200, resizeMode: "cover", marginTop: 8, borderRadius: 8 },
});
