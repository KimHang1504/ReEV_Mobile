import { View, Text, Image, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

const OrderDetailScreen = () => {
  const { params } = useRoute();
  const { order } = params || {};

  if (!order)
    return (
      <View style={styles.centered}>
        <Text>Không tìm thấy thông tin đơn hàng.</Text>
      </View>
    );

  const product = order.product || {};

  return (
 <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.title}>Chi tiết đơn hàng</Text>

        <View style={styles.box}>
          <Text style={styles.label}>Mã đơn hàng:</Text>
          <Text style={styles.value}>{order.orderId}</Text>

          <Text style={styles.label}>Trạng thái:</Text>
          <Text style={[styles.value, { color: "#007AFF" }]}>{order.status || "Đang xử lý"}</Text>

          <Text style={styles.label}>Ngày tạo:</Text>
          <Text style={styles.value}>
            {new Date(order.createdAt).toLocaleString()}
          </Text>
        </View>

        <View style={styles.box}>
          <Text style={styles.label}>Sản phẩm:</Text>
          <Text style={styles.value}>{product.title}</Text>

          <Image
            source={{ uri: product.imageUrls?.[0] || "https://via.placeholder.com/150" }}
            style={styles.image}
          />

          <Text style={styles.label}>Giá:</Text>
          <Text style={styles.value}>
            {Number(order.totalPrice || product.price_buy_now).toLocaleString()} ₫
          </Text>

          <Text style={styles.label}>Phí vận chuyển:</Text>
          <Text style={styles.value}>
            {Number(order.totalShippingFee || 0).toLocaleString()} ₫
          </Text>

          <Text style={styles.label}>Tổng thanh toán:</Text>
          <Text style={[styles.value, { color: "#E53935", fontSize: 18 }]}>
            {Number(order.grandTotal || 0).toLocaleString()} ₫
          </Text>
        </View>

        <View style={styles.box}>
          <Text style={styles.label}>Người bán:</Text>
          <Text style={styles.value}>{product?.seller?.fullName || "Không rõ"}</Text>
          <Text style={styles.label}>Địa chỉ:</Text>
          <Text style={styles.value}>{product?.seller?.defaultAddress?.line1 || "Không rõ"}</Text>
          <Text style={styles.label}>Số điện thoại:</Text>
          <Text style={styles.value}>{product?.seller?.defaultAddress?.phone || "Không rõ"}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default OrderDetailScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FB" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 20, color: "#333" },
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
  label: { color: "#666", marginTop: 6 },
  value: { fontWeight: "600", color: "#222" },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginVertical: 10,
  },
});
