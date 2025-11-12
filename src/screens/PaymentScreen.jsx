import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { orderService } from '../services/orderService';
import { paymentService } from "../services/paymentService";
import { walletService } from "../services/walletService";

const PaymentScreen = () => {
  const { params } = useRoute();
  const navigation = useNavigation();
  const { user } = useAuth();
  const product = params?.product;
  const auctionId = params?.auctionId; // 🆕 Auction payment
  const auctionAmount = params?.amount; // 🆕 Amount from auction

  const [order, setOrder] = useState(null);
  const [method, setMethod] = useState("payos");
  const [wallet, setWallet] = useState(0);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        // 🆕 If from auction, fetch order by auctionId
        if (auctionId) {
          // Backend creates order when auction ends, we need to find it
          // For now, we'll create a mock order structure
          const mockOrder = {
            orderId: `auction-${auctionId}`,
            grandTotal: auctionAmount || 0,
            totalPrice: auctionAmount || 0,
            totalShippingFee: 0,
          };
          setOrder(mockOrder);
          
          // Get wallet balance
          const data = await walletService.getAvailable();
          setWallet(data?.available || 0);
          setLoading(false);
          return;
        }

        if (!user?.userId || !product?.id) {
          Alert.alert("Lỗi", "Thiếu thông tin sản phẩm hoặc người mua");
          navigation.goBack();
          return;
        }

        // 🔹 1. Tạo đơn hàng trước
        const createdOrder = await orderService.createOrder(user.userId, {
          receiverName: user.fullName, // 👈 người nhận là buyer hiện tại
          receiverPhone: user.phone,
          receiverAddress: user.addresses?.[0]?.line1 || 'Không rõ địa chỉ',
          receiverWardCode: user.addresses?.[0]?.wardCode || '',
          receiverDistrictId: String(user.addresses?.[0]?.districtId || ''),

          orderShops: [
            {
              sellerId: product.seller?.userId, // 👈 người bán
              orderDetails: [
                {
                  productId: product.id,
                  quantity: 1,
                  price: Number(product.price_buy_now), // "1000.00"
                  subtotal: Number(product.price_buy_now), // ✅ BE tự cộng ship
                },
              ],
            },
          ],
        });


        setOrder(createdOrder);

        // 🔹 2. Lấy ví
        const data = await walletService.getAvailable();
        setWallet(data?.available || 0);

      } catch (err) {
        console.error("❌ Error init payment:", err);
        Alert.alert("Lỗi", "Không thể tạo đơn hàng.");
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const handlePay = async () => {
    try {
      if (!order?.orderId) {
        Alert.alert("Lỗi", "Không có orderId.");
        return;
      }

      setPaying(true);

      if (method === "wallet") {
        // 🌐 Redirect to web for wallet payment
        const webPaymentUrl = `${process.env.EXPO_PUBLIC_WEB_URL || 'http://localhost:5173'}/payment?orderId=${order.orderId}&mobile=true`;
        const canOpen = await Linking.canOpenURL(webPaymentUrl);
        
        if (canOpen) {
          await Linking.openURL(webPaymentUrl);
          // Navigate to a waiting screen or just go back
          // The web will handle the payment and redirect back to the app
          Alert.alert(
            "Thanh toán",
            "Vui lòng hoàn tất thanh toán trên trình duyệt. Sau khi thanh toán thành công, bạn sẽ được chuyển về ứng dụng.",
            [
              {
                text: "OK",
                onPress: () => navigation.goBack()
              }
            ]
          );
        } else {
          Alert.alert("Lỗi", "Không thể mở trình duyệt");
        }
      } else {
        const payment = await paymentService.payWithPayOS(order.orderId);
        if (payment?.checkoutUrl) {
          Linking.openURL(payment.checkoutUrl);
        } else {
          Alert.alert("Lỗi", "Không nhận được link thanh toán.");
        }
      }
    } catch (e) {
      console.error("💥 Payment error:", e.response?.data || e.message);
      Alert.alert("Thanh toán thất bại", "Vui lòng thử lại sau.");
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Đang khởi tạo đơn hàng...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Thanh toán đơn hàng</Text>

      {/* Thông tin giá từ BE */}
      <View style={styles.box}>
        <Text style={styles.label}>
          {auctionId ? 'Sản phẩm đấu giá:' : 'Sản phẩm:'}
        </Text>
        <Text style={styles.value}>
          {auctionId ? 'Sản phẩm đấu giá' : product?.title}
        </Text>

        <Text style={styles.label}>
          {auctionId ? 'Giá trúng đấu giá:' : 'Giá sản phẩm:'}
        </Text>
        <Text style={styles.value}>
          {Number(order?.totalPrice || product?.price_buy_now || auctionAmount || 0).toLocaleString()} ₫
        </Text>

        {!auctionId && (
          <>
            <Text style={styles.label}>Phí vận chuyển:</Text>
            <Text style={styles.value}>
              {Number(order?.totalShippingFee || 0).toLocaleString()} ₫
            </Text>
          </>
        )}

        <Text style={[styles.label, { fontWeight: '700', marginTop: 8 }]}>
          Tổng thanh toán:
        </Text>
        <Text style={[styles.value, { color: '#E53935', fontSize: 18 }]}>
          {Number(order?.grandTotal || 0).toLocaleString()} ₫
        </Text>

      </View>

      {/* Phương thức thanh toán */}
      <Text style={styles.section}>Phương thức thanh toán</Text>

      <Pressable
        style={[styles.method, method === "payos" && styles.selected]}
        onPress={() => setMethod("payos")}
      >
        <Ionicons name="card-outline" size={20} color="#007AFF" />
        <Text style={styles.methodText}>Thanh toán qua PayOS</Text>
      </Pressable>

      <Pressable
        style={[styles.method, method === "wallet" && styles.selected]}
        onPress={() => setMethod("wallet")}
      >
        <Ionicons name="wallet-outline" size={20} color="#007AFF" />
        <Text style={styles.methodText}>
          Thanh toán bằng ví ({wallet.toLocaleString()} ₫)
        </Text>
      </Pressable>

      <Pressable
        style={[styles.payButton, paying && { opacity: 0.6 }]}
        disabled={paying}
        onPress={handlePay}
      >
        {paying ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="checkmark-done-outline" size={20} color="#fff" />
            <Text style={styles.payText}>
              {method === "wallet" ? "Thanh toán bằng ví" : "Thanh toán PayOS"}
            </Text>
          </>
        )}
      </Pressable>
    </SafeAreaView>
  );
};

export default PaymentScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FB", padding: 16 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "700", textAlign: "center", marginBottom: 24 },
  box: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 1,
  },
  label: { color: "#555", marginTop: 6 },
  value: { fontWeight: "600", color: "#222" },
  section: { fontSize: 16, fontWeight: "700", marginVertical: 16 },
  method: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  selected: { borderColor: "#007AFF", backgroundColor: "#E6F0FF" },
  methodText: { marginLeft: 10, fontSize: 15, color: "#333" },
  payButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007AFF",
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 20,
  },
  payText: { color: "#fff", fontSize: 16, fontWeight: "700", marginLeft: 8 },
});
