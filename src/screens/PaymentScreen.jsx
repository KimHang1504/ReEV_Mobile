import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderService';
import { paymentService } from '../services/paymentService';
import { walletService } from '../services/walletService';
import { SafeAreaView } from 'react-native-safe-area-context';

const PaymentScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { product } = route.params || {};

  const [method, setMethod] = useState('payos'); // payos | wallet
  const [loading, setLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);

  // 🧩 Lấy số dư ví
  useEffect(() => {
    const loadWallet = async () => {
      try {
        const data = await walletService.getAvailable();
        setWalletBalance(Number(data?.available || 0));
      } catch (e) {
        console.warn('⚠️ Không lấy được số dư ví:', e.message);
      }
    };
    loadWallet();
  }, []);

  const handlePayment = async () => {
    try {
      if (!user?.userId) {
        return Alert.alert('Thông báo', 'Vui lòng đăng nhập để thanh toán.');
      }

      if (!product?.id) {
        return Alert.alert('Lỗi', 'Không có thông tin sản phẩm.');
      }

      setLoading(true);

      // 1️⃣ Tạo đơn hàng trước
      const order = await orderService.createOrder(user.userId, {
        productId: product.id,
        quantity: 1,
      });

      const orderId = order?.orderId || order?.data?.orderId;
      if (!orderId) throw new Error('Không tìm thấy orderId.');

      // 2️⃣ Xử lý theo phương thức thanh toán
      if (method === 'wallet') {
        if (walletBalance < parseFloat(product.price_buy_now)) {
          Alert.alert('⚠️ Số dư không đủ', 'Vui lòng nạp thêm tiền hoặc chọn phương thức khác.');
          setLoading(false);
          return;
        }

        const result = await walletService.payOrder(orderId);
        if (result?.success) {
          Alert.alert('✅ Thanh toán thành công!', 'Đã trừ tiền trong ví của bạn.', [
            { text: 'OK', onPress: () => navigation.replace('MainTabs') },
          ]);
        } else {
          Alert.alert('❌ Thanh toán thất bại', result?.message || 'Vui lòng thử lại.');
        }
      } else {
        const payment = await paymentService.createPayment(orderId);
        if (payment?.checkoutUrl) {
          Linking.openURL(payment.checkoutUrl);
        } else {
          Alert.alert('Lỗi', 'Không nhận được link thanh toán.');
        }
      }
    } catch (err) {
      console.error('💥 Payment error:', err.response?.data || err.message);
      Alert.alert('Thanh toán thất bại', err.response?.data?.message || 'Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  if (!product) {
    return (
      <View style={styles.centered}>
        <Text>Không có thông tin sản phẩm.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Thanh toán sản phẩm</Text>

      {/* 🛍️ Thông tin sản phẩm */}
      <View style={styles.box}>
        <Text style={styles.label}>Tên sản phẩm:</Text>
        <Text style={styles.value}>{product.title}</Text>

        <Text style={styles.label}>Giá mua ngay:</Text>
        <Text style={[styles.value, { color: '#E53935' }]}>
          {Number(product.price_buy_now).toLocaleString()} ₫
        </Text>
      </View>

      {/* 💳 Chọn phương thức */}
      <Text style={styles.section}>Chọn phương thức thanh toán</Text>

      <View style={styles.methodBox}>
        <Pressable
          style={[styles.method, method === 'payos' && styles.selected]}
          onPress={() => setMethod('payos')}
        >
          <Ionicons name="card-outline" size={20} color="#007AFF" />
          <Text style={styles.methodText}>Thanh toán qua PayOS</Text>
        </Pressable>

        <Pressable
          style={[styles.method, method === 'wallet' && styles.selected]}
          onPress={() => setMethod('wallet')}
        >
          <Ionicons name="wallet-outline" size={20} color="#007AFF" />
          <Text style={styles.methodText}>
            Thanh toán bằng ví ({walletBalance.toLocaleString()} ₫)
          </Text>
        </Pressable>
      </View>

      {/* ⚡ Nút thanh toán */}
      <Pressable
        style={[styles.payButton, loading && { opacity: 0.6 }]}
        disabled={loading}
        onPress={handlePayment}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="checkmark-done-outline" size={20} color="#fff" />
            <Text style={styles.payText}>
              {method === 'wallet' ? 'Thanh toán bằng ví' : 'Thanh toán PayOS'}
            </Text>
          </>
        )}
      </Pressable>
    </SafeAreaView>
  );
};

export default PaymentScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FB', padding: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 24 },
  box: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 2,
  },
  label: { color: '#555', marginTop: 6 },
  value: { fontWeight: '600', color: '#222' },
  section: { fontSize: 16, fontWeight: '700', marginVertical: 16 },
  methodBox: {},
  method: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selected: { borderColor: '#007AFF', backgroundColor: '#E6F0FF' },
  methodText: { marginLeft: 10, fontSize: 15, color: '#333' },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 30,
  },
  payText: { color: '#fff', fontSize: 16, fontWeight: '700', marginLeft: 8 },
});
