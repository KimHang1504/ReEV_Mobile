import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { orderService } from "../services/orderService";

export default function OrderHistoryScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const { items } = await orderService.getOrdersByBuyer(user.userId, {
          page: 1,
          limit: 20,
        });
        setOrders(items || []);
      } catch (err) {
        console.error("❌ Load orders error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!orders.length) {
    return (
      <View style={styles.centered}>
        <Text>Chưa có đơn hàng nào</Text>
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <Pressable
      style={styles.card}
      onPress={() =>
        navigation.navigate("OrderDetail", {
          orderId: item.orderId, // 👈 điều hướng sang chi tiết
        })
      }
    >
      <View style={styles.row}>
        <Ionicons name="receipt-outline" size={20} color="#007AFF" />
        <Text style={styles.title}>Mã đơn: {item.orderId.slice(0, 8)}</Text>
      </View>
      <Text style={styles.subText}>
        Trạng thái:{" "}
        <Text style={{ color: "#007AFF" }}>{item.status?.toUpperCase()}</Text>
      </Text>
      <Text style={styles.subText}>
        Tổng tiền:{" "}
        <Text style={{ fontWeight: "700", color: "#E53935" }}>
          {Number(item.grandTotal || 0).toLocaleString()} ₫
        </Text>
      </Text>
      <Text style={styles.date}>
        Ngày đặt: {new Date(item.createdAt).toLocaleString("vi-VN")}
      </Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🧾 Lịch sử đơn hàng</Text>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.orderId}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FB", padding: 16 },
  header: { fontSize: 20, fontWeight: "700", marginBottom: 16 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  title: { fontWeight: "700", marginLeft: 8 },
  subText: { color: "#444", marginTop: 2 },
  date: { color: "#777", fontSize: 12, marginTop: 6 },
});
