// src/screens/CheckoutScreen.jsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { addressService } from '../services/addressService';
import { orderService } from '../services/orderService';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, borderRadius, typography, shadows } from '../constants/theme';

const CheckoutScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const { orders, product } = route.params || {};

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);

  // 🔹 Fetch addresses
  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const list = await addressService.getMyAddresses();
      setAddresses(list || []);
      
      // Set default address
      const defaultAddr = list.find((a) => a.isDefault);
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.addressId);
      } else if (list.length > 0) {
        setSelectedAddressId(list[0].addressId);
      }
    } catch (err) {
      console.error('❌ Fetch addresses error:', err);
      Alert.alert('Lỗi', 'Không thể tải danh sách địa chỉ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  // 🔹 Calculate totals
  const calculateTotals = () => {
    if (orders && orders.length > 0) {
      const subtotal = orders.reduce((sum, order) => {
        const orderDetails = order.orderShops?.[0]?.orderDetails || [];
        return (
          sum +
          orderDetails.reduce(
            (detailSum, detail) => detailSum + (detail.price || 0) * (detail.quantity || 1),
            0
          )
        );
      }, 0);
      const shipping = orders.reduce((sum, order) => sum + (order.totalShippingFee || 0), 0);
      return { subtotal, shipping, total: subtotal + shipping };
    } else if (product) {
      const price = product.price_buy_now || 0;
      return { subtotal: price, shipping: 0, total: price };
    }
    return { subtotal: 0, shipping: 0, total: 0 };
  };

  const { subtotal, shipping, total } = calculateTotals();

  // 🔹 Handle checkout
  const handleCheckout = async () => {
    if (!selectedAddressId) {
      Alert.alert('Lỗi', 'Vui lòng chọn địa chỉ giao hàng.');
      return;
    }

    const selectedAddress = addresses.find((a) => a.addressId === selectedAddressId);
    if (!selectedAddress) {
      Alert.alert('Lỗi', 'Địa chỉ không hợp lệ.');
      return;
    }

    if (orders && orders.length > 0) {
      // Checkout từ cart - navigate to payment với orders
      navigation.navigate('PaymentScreen', {
        orders,
        address: selectedAddress,
      });
    } else if (product) {
      // Checkout trực tiếp từ product - tạo order trước
      try {
        setConfirming(true);
        const payload = {
          receiverName: selectedAddress.fullName,
          receiverPhone: selectedAddress.phone,
          receiverAddress: selectedAddress.line1,
          receiverDistrictId: selectedAddress.districtId,
          receiverWardCode: selectedAddress.wardCode,
          receiverAddressId: selectedAddress.addressId,
          orderShops: [
            {
              sellerId: product.seller?.userId,
              shippingProvider: 'GHN',
              fromAddressId: product.seller?.defaultAddress?.addressId,
              orderDetails: [
                {
                  productId: product.id,
                  quantity: 1,
                  price: Number(product.price_buy_now),
                  subtotal: Number(product.price_buy_now),
                },
              ],
            },
          ],
        };

        const order = await orderService.createOrder(user.sub, payload);
        Alert.alert('Thành công', 'Đơn hàng đã được tạo!');
        navigation.navigate('PaymentScreen', {
          orderId: order.orderId,
          amount: total,
        });
      } catch (err) {
        console.error('❌ Create order error:', err);
        Alert.alert('Lỗi', err.response?.data?.message || 'Không thể tạo đơn hàng.');
      } finally {
        setConfirming(false);
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const selectedAddress = addresses.find((a) => a.addressId === selectedAddressId);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Thanh toán</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Address Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location" size={24} color={colors.primary} />
            <Text style={styles.sectionTitle}>Địa chỉ giao hàng</Text>
            <Pressable
              style={styles.addAddressBtn}
              onPress={() => navigation.navigate('AddressManagement')}
            >
              <Ionicons name="add-circle" size={20} color={colors.primary} />
              <Text style={styles.addAddressText}>Thêm</Text>
            </Pressable>
          </View>

          {addresses.length === 0 ? (
            <View style={styles.emptyAddress}>
              <Text style={styles.emptyAddressText}>
                Chưa có địa chỉ. Vui lòng thêm địa chỉ mới.
              </Text>
              <Pressable
                style={styles.addFirstAddressBtn}
                onPress={() => navigation.navigate('AddressManagement')}
              >
                <Text style={styles.addFirstAddressText}>Thêm địa chỉ</Text>
              </Pressable>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {addresses.map((address) => {
                const isSelected = address.addressId === selectedAddressId;
                return (
                  <Pressable
                    key={address.addressId}
                    style={[
                      styles.addressCard,
                      isSelected && styles.addressCardSelected,
                    ]}
                    onPress={() => setSelectedAddressId(address.addressId)}
                  >
                    {isSelected && (
                      <View style={styles.selectedBadge}>
                        <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                      </View>
                    )}
                    <View style={styles.addressHeader}>
                      <Text style={styles.addressLabel}>{address.label || 'Địa chỉ'}</Text>
                      {address.isDefault && (
                        <View style={styles.defaultBadge}>
                          <Text style={styles.defaultBadgeText}>Mặc định</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.addressName}>{address.fullName}</Text>
                    <Text style={styles.addressPhone}>{address.phone}</Text>
                    <Text style={styles.addressLine} numberOfLines={2}>
                      {address.line1}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="receipt" size={24} color={colors.primary} />
            <Text style={styles.sectionTitle}>Tóm tắt đơn hàng</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tạm tính:</Text>
            <Text style={styles.summaryValue}>
              {subtotal.toLocaleString('vi-VN')} ₫
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Phí vận chuyển:</Text>
            <Text style={styles.summaryValue}>
              {shipping.toLocaleString('vi-VN')} ₫
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryTotalLabel}>Tổng cộng:</Text>
            <Text style={styles.summaryTotalValue}>
              {total.toLocaleString('vi-VN')} ₫
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Checkout Button */}
      <View style={styles.footer}>
        <Pressable
          style={styles.checkoutBtn}
          onPress={handleCheckout}
          disabled={!selectedAddressId || confirming}
        >
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientEnd]}
            style={styles.checkoutBtnGradient}
          >
            {confirming ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="card" size={20} color="#fff" />
                <Text style={styles.checkoutBtnText}>
                  Thanh toán {total.toLocaleString('vi-VN')} ₫
                </Text>
              </>
            )}
          </LinearGradient>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default CheckoutScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  headerGradient: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.h3,
    color: '#fff',
  },
  container: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  sectionTitle: {
    flex: 1,
    ...typography.h4,
    color: colors.text,
  },
  addAddressBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.primary + '15',
    borderRadius: borderRadius.sm,
  },
  addAddressText: {
    ...typography.captionBold,
    color: colors.primary,
  },
  emptyAddress: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  emptyAddressText: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  addFirstAddressBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
  },
  addFirstAddressText: {
    ...typography.bodyBold,
    color: '#fff',
  },
  addressCard: {
    width: 280,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginRight: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
  },
  addressCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  selectedBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  addressLabel: {
    ...typography.bodyBold,
    color: colors.text,
  },
  defaultBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  defaultBadgeText: {
    ...typography.small,
    color: '#fff',
    fontWeight: '700',
  },
  addressName: {
    ...typography.bodyBold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  addressPhone: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  addressLine: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  summaryValue: {
    ...typography.bodyBold,
    color: colors.text,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.sm,
  },
  summaryTotalLabel: {
    ...typography.h4,
    color: colors.text,
  },
  summaryTotalValue: {
    ...typography.h3,
    color: colors.primary,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: spacing.md,
    ...shadows.lg,
  },
  checkoutBtn: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  checkoutBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  checkoutBtnText: {
    ...typography.bodyBold,
    color: '#fff',
  },
});

