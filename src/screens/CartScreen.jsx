// src/screens/CartScreen.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { orderService } from '../services/orderService';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, borderRadius, typography, shadows } from '../constants/theme';

const CartScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [removing, setRemoving] = useState(null);

  // 🔹 Fetch cart items (orders với status PENDING)
  const fetchCartItems = async () => {
    try {
      setLoading(true);
      if (!user?.sub) {
        setItems([]);
        return;
      }

      const { items: orders } = await orderService.getOrdersByBuyer(user.sub, {
        status: 'pending',
        page: 1,
        limit: 100,
      });

      setItems(orders || []);
    } catch (err) {
      console.error('❌ Fetch cart error:', err);
      Alert.alert('Lỗi', 'Không thể tải giỏ hàng.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCartItems();
    }, [user?.sub])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCartItems();
    setRefreshing(false);
  };

  // 🔹 Remove item from cart
  const handleRemove = async (orderId) => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              setRemoving(orderId);
              // TODO: Implement delete order API
              // await orderService.deleteOrder(orderId);
              await fetchCartItems();
            } catch (err) {
              Alert.alert('Lỗi', 'Không thể xóa sản phẩm.');
            } finally {
              setRemoving(null);
            }
          },
        },
      ]
    );
  };

  // 🔹 Toggle select item
  const handleToggleSelect = (orderId) => {
    setSelectedItems((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  // 🔹 Select all
  const handleSelectAll = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map((item) => item.orderId));
    }
  };

  // 🔹 Calculate totals
  const selectedOrders = items.filter((item) => selectedItems.includes(item.orderId));
  const subtotal = selectedOrders.reduce((sum, order) => {
    const orderDetails = order.orderShops?.[0]?.orderDetails || [];
    return (
      sum +
      orderDetails.reduce(
        (detailSum, detail) => detailSum + (detail.price || 0) * (detail.quantity || 1),
        0
      )
    );
  }, 0);
  const shipping = selectedOrders.reduce((sum, order) => sum + (order.totalShippingFee || 0), 0);
  const total = subtotal + shipping;

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Đang tải giỏ hàng...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Gradient Header */}
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="cart" size={28} color="#fff" />
            <View>
              <Text style={styles.headerTitle}>Giỏ hàng</Text>
              <Text style={styles.headerSubtitle}>
                {items.length} sản phẩm
              </Text>
            </View>
          </View>
          {items.length > 0 && (
            <Pressable onPress={handleSelectAll} style={styles.selectAllBtn}>
              <Text style={styles.selectAllText}>
                {selectedItems.length === items.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
              </Text>
            </Pressable>
          )}
        </View>
      </LinearGradient>

      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="cart-outline" size={80} color={colors.textLight} />
          </View>
          <Text style={styles.emptyTitle}>Giỏ hàng trống</Text>
          <Text style={styles.emptyText}>
            Bắt đầu mua sắm để thêm sản phẩm vào giỏ hàng
          </Text>
          <Pressable
            style={styles.shopNowBtn}
            onPress={() => navigation.navigate('Home')}
          >
            <LinearGradient
              colors={[colors.gradientStart, colors.gradientEnd]}
              style={styles.shopNowBtnGradient}
            >
              <Text style={styles.shopNowText}>Tiếp tục mua sắm</Text>
            </LinearGradient>
          </Pressable>
        </View>
      ) : (
        <>
          <ScrollView
            contentContainerStyle={styles.container}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.primary}
              />
            }
          >
            {items.map((item) => {
              const isSelected = selectedItems.includes(item.orderId);
              const product = item.orderShops?.[0]?.orderDetails?.[0]?.product;
              const imageUrl = product?.imageUrls?.[0] || 'https://via.placeholder.com/200';
              const productTitle = product?.title || 'Sản phẩm';
              const price = item.orderShops?.[0]?.orderDetails?.[0]?.price || 0;
              const quantity = item.orderShops?.[0]?.orderDetails?.[0]?.quantity || 1;

              return (
                <View key={item.orderId} style={styles.cartItem}>
                  <Pressable
                    style={styles.checkbox}
                    onPress={() => handleToggleSelect(item.orderId)}
                  >
                    <Ionicons
                      name={isSelected ? 'checkbox' : 'checkbox-outline'}
                      size={24}
                      color={isSelected ? colors.primary : colors.border}
                    />
                  </Pressable>

                  <Pressable
                    style={styles.itemContent}
                    onPress={() => navigation.navigate('Detail', { productId: product?.id })}
                  >
                    <Image source={{ uri: imageUrl }} style={styles.itemImage} />
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemTitle} numberOfLines={2}>
                        {productTitle}
                      </Text>
                      <Text style={styles.itemPrice}>
                        {parseFloat(price).toLocaleString('vi-VN')} ₫
                      </Text>
                      <Text style={styles.itemQuantity}>Số lượng: {quantity}</Text>
                    </View>
                  </Pressable>

                  <Pressable
                    style={styles.removeBtn}
                    onPress={() => handleRemove(item.orderId)}
                    disabled={removing === item.orderId}
                  >
                    {removing === item.orderId ? (
                      <ActivityIndicator size="small" color={colors.error} />
                    ) : (
                      <Ionicons name="trash-outline" size={20} color={colors.error} />
                    )}
                  </Pressable>
                </View>
              );
            })}
          </ScrollView>

          {/* Order Summary Footer */}
          {selectedItems.length > 0 && (
            <View style={styles.footer}>
              <View style={styles.summary}>
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

              <Pressable
                style={styles.checkoutBtn}
                onPress={() => {
                  const selectedOrders = items.filter((item) =>
                    selectedItems.includes(item.orderId)
                  );
                  navigation.navigate('Checkout', { orders: selectedOrders });
                }}
              >
                <LinearGradient
                  colors={[colors.gradientStart, colors.gradientEnd]}
                  style={styles.checkoutBtnGradient}
                >
                  <Text style={styles.checkoutBtnText}>
                    Thanh toán ({selectedItems.length})
                  </Text>
                </LinearGradient>
              </Pressable>
            </View>
          )}
        </>
      )}
    </SafeAreaView>
  );
};

export default CartScreen;

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
  loadingText: {
    marginTop: spacing.md,
    ...typography.body,
    color: colors.textSecondary,
  },
  headerGradient: {
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerTitle: {
    ...typography.h2,
    color: '#fff',
  },
  headerSubtitle: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.9)',
  },
  selectAllBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: borderRadius.md,
  },
  selectAllText: {
    ...typography.captionBold,
    color: '#fff',
  },
  container: {
    padding: spacing.md,
    paddingBottom: 120,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'center',
    ...shadows.md,
  },
  checkbox: {
    marginRight: spacing.md,
  },
  itemContent: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.md,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
    backgroundColor: colors.divider,
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  itemTitle: {
    ...typography.bodyBold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  itemPrice: {
    ...typography.h4,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  itemQuantity: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  removeBtn: {
    padding: spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.divider,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  shopNowBtn: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    ...shadows.lg,
  },
  shopNowBtnGradient: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  shopNowText: {
    ...typography.bodyBold,
    color: '#fff',
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
  summary: {
    marginBottom: spacing.md,
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
  checkoutBtn: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    ...shadows.lg,
  },
  checkoutBtnGradient: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutBtnText: {
    ...typography.bodyBold,
    color: '#fff',
  },
});

