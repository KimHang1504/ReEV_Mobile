import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  RefreshControl,
  ScrollView,
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { orderService } from "../services/orderService";
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, typography, shadows } from '../constants/theme';
import { Image } from 'react-native';

export default function OrderHistoryScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');

  const statusOptions = [
    { label: 'Tất cả', value: 'all' },
    { label: 'Chờ thanh toán', value: 'pending' },
    { label: 'Đã thanh toán', value: 'paid' },
    { label: 'Đang giao', value: 'in_transit' },
    { label: 'Đã giao', value: 'delivered' },
    { label: 'Hoàn thành', value: 'completed' },
    { label: 'Đã hủy', value: 'cancelled' },
  ];

  const loadOrders = async () => {
    try {
      setLoading(true);
      const { items } = await orderService.getOrdersByBuyer(user?.sub || user?.userId, {
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        page: 1,
        limit: 50,
      });
      setOrders(items || []);
    } catch (err) {
      console.error("❌ Load orders error:", err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [selectedStatus, user?.sub, user?.userId])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return colors.success;
      case 'pending':
        return colors.warning;
      case 'in_transit':
        return colors.info;
      case 'delivered':
      case 'completed':
        return colors.success;
      case 'cancelled':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Chờ thanh toán',
      paid: 'Đã thanh toán',
      in_transit: 'Đang giao',
      delivered: 'Đã giao',
      completed: 'Hoàn thành',
      cancelled: 'Đã hủy',
    };
    return labels[status?.toLowerCase()] || status?.toUpperCase() || 'N/A';
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

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
          <Ionicons name="receipt" size={28} color="#fff" />
          <View>
            <Text style={styles.headerTitle}>Lịch sử đơn hàng</Text>
            <Text style={styles.headerSubtitle}>
              {orders.length} đơn hàng
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Status Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {statusOptions.map((option) => (
          <Pressable
            key={option.value}
            style={[
              styles.filterChip,
              selectedStatus === option.value && styles.filterChipSelected,
            ]}
            onPress={() => setSelectedStatus(option.value)}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedStatus === option.value && styles.filterChipTextSelected,
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="receipt-outline" size={80} color={colors.textLight} />
          </View>
          <Text style={styles.emptyTitle}>Chưa có đơn hàng</Text>
          <Text style={styles.emptyText}>
            {selectedStatus !== 'all'
              ? 'Không có đơn hàng với trạng thái này'
              : 'Bắt đầu mua sắm để xem đơn hàng của bạn'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.orderId}
          renderItem={({ item }) => {
            const statusColor = getStatusColor(item.status);
            const orderShops = item.orderShops || [];
            const firstShop = orderShops[0] || {};
            const orderDetails = firstShop.orderDetails || [];
            const totalItems = orderDetails.reduce((sum, od) => sum + (od.quantity || 1), 0);
            const firstProduct = orderDetails[0]?.product;
            const imageUrl = firstProduct?.imageUrls?.[0] || 'https://via.placeholder.com/200';
            const hasMultipleItems = orderDetails.length > 1;

            return (
              <Pressable
                style={styles.card}
                onPress={() =>
                  navigation.navigate('OrderDetail', {
                    orderId: item.orderId,
                  })
                }
              >
                {/* Card Header với Status */}
                <View style={styles.cardHeader}>
                  <View style={styles.orderInfo}>
                    <View style={styles.orderIdRow}>
                      <Ionicons name="receipt" size={20} color={colors.primary} />
                      <Text style={styles.orderId}>
                        Đơn hàng #{item.orderId?.slice(-8) || 'N/A'}
                      </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor + '15', borderColor: statusColor }]}>
                      <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                      <Text style={[styles.statusText, { color: statusColor }]}>
                        {getStatusLabel(item.status)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.chevronContainer}>
                    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                  </View>
                </View>

                {/* Product Display */}
                {firstProduct && (
                  <View style={styles.productSection}>
                    <Image
                      source={{ uri: imageUrl }}
                      style={styles.productImage}
                    />
                    <View style={styles.productInfo}>
                      <Text style={styles.productTitle} numberOfLines={2}>
                        {firstProduct.title || 'Sản phẩm'}
                      </Text>
                      {hasMultipleItems && (
                        <Text style={styles.itemCount}>
                          +{orderDetails.length - 1} sản phẩm khác
                        </Text>
                      )}
                      <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>Tổng tiền:</Text>
                        <Text style={styles.productPrice}>
                          {parseFloat(item.grandTotal || 0).toLocaleString('vi-VN')} ₫
                        </Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* Footer với Date và Action */}
                <View style={styles.cardFooter}>
                  <View style={styles.footerLeft}>
                    <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                    <Text style={styles.date}>
                      {new Date(item.createdAt).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>
                  {item.status === 'pending' && (
                    <Pressable
                      style={styles.payNowBtn}
                      onPress={() => navigation.navigate('PaymentScreen', { orderId: item.orderId })}
                    >
                      <Text style={styles.payNowText}>Thanh toán</Text>
                    </Pressable>
                  )}
                </View>
              </Pressable>
            );
          }}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

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
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  header: {
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
  filterContainer: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    ...typography.captionBold,
    color: colors.text,
  },
  filterChipTextSelected: {
    color: '#fff',
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  orderInfo: {
    flex: 1,
  },
  orderIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  orderId: {
    ...typography.bodyBold,
    color: colors.text,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    gap: spacing.xs,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    ...typography.small,
    fontWeight: '700',
    fontSize: 11,
  },
  chevronContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productSection: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
    backgroundColor: colors.divider,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  productTitle: {
    ...typography.bodyBold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  itemCount: {
    ...typography.caption,
    color: colors.primary,
    marginBottom: spacing.xs,
    fontStyle: 'italic',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  priceLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  productPrice: {
    ...typography.h4,
    color: colors.primary,
    fontWeight: '700',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  date: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  payNowBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
  },
  payNowText: {
    ...typography.captionBold,
    color: '#fff',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
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
  },
});
