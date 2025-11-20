import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, ScrollView, ActivityIndicator, Pressable } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { orderService } from "../services/orderService";
import { colors, spacing, borderRadius, typography, shadows } from '../constants/theme';

const fmt = (n) => Number(n || 0).toLocaleString("vi-VN") + " ₫";

const OrderDetailScreen = () => {
  const { params } = useRoute();
  const navigation = useNavigation();
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

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Đang tải chi tiết đơn hàng...</Text>
      </View>
    );
  }

  if (!detail) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={60} color={colors.error} />
        <Text style={styles.errorText}>Không tìm thấy thông tin đơn hàng</Text>
      </View>
    );
  }

  // --- Quan trọng: bóc đúng nhánh ở trong orderShops[0] ---
  const shop = detail.orderShops?.[0] || {};
  const orderDetails = shop.orderDetails || [];
  const firstOd = orderDetails[0] || {};
  const product = firstOd.product || {};
  const seller = shop.seller || {};
  const statusColor = getStatusColor(detail.status);

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
          <Text style={styles.headerTitle}>Chi tiết đơn hàng</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Order Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="receipt" size={24} color={colors.primary} />
            <Text style={styles.cardTitle}>Thông tin đơn hàng</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Mã đơn hàng</Text>
            <Text style={styles.infoValue}>#{detail.orderId?.slice(-8) || 'N/A'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Trạng thái</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '15', borderColor: statusColor }]}>
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <Text style={[styles.statusText, { color: statusColor }]}>
                {getStatusLabel(detail.status)}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ngày đặt</Text>
            <Text style={styles.infoValue}>
              {new Date(detail.createdAt).toLocaleString('vi-VN')}
            </Text>
          </View>
        </View>

        {/* Products Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="cube" size={24} color={colors.secondary} />
            <Text style={styles.cardTitle}>Sản phẩm</Text>
          </View>

          {orderDetails.map((od, index) => {
            const prod = od.product || {};
            return (
              <View key={index} style={styles.productItem}>
                <Image
                  source={{ uri: prod.imageUrls?.[0] || "https://via.placeholder.com/150" }}
                  style={styles.productImage}
                />
                <View style={styles.productDetails}>
                  <Text style={styles.productTitle} numberOfLines={2}>
                    {prod.title || "Sản phẩm"}
                  </Text>
                  <Text style={styles.productQuantity}>
                    Số lượng: {od.quantity || 1}
                  </Text>
                  <Text style={styles.productPrice}>
                    {fmt(od.price || od.subtotal || 0)}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Price Summary Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="calculator" size={24} color={colors.success} />
            <Text style={styles.cardTitle}>Tóm tắt thanh toán</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tạm tính</Text>
            <Text style={styles.summaryValue}>
              {fmt(detail.totalPrice || 0)}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Phí vận chuyển</Text>
            <Text style={styles.summaryValue}>
              {fmt(shop.shippingFee ?? detail.totalShippingFee ?? 0)}
            </Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryTotalLabel}>Tổng thanh toán</Text>
            <Text style={styles.summaryTotalValue}>
              {fmt(detail.grandTotal || 0)}
            </Text>
          </View>
        </View>

        {/* Seller Info Card */}
        {seller && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="storefront" size={24} color={colors.info} />
              <Text style={styles.cardTitle}>Người bán</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tên cửa hàng</Text>
              <Text style={styles.infoValue}>{seller.fullName || "—"}</Text>
            </View>

            {seller.phone && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Điện thoại</Text>
                <Text style={styles.infoValue}>{seller.phone}</Text>
              </View>
            )}
          </View>
        )}

        {/* Action Button */}
        {detail.status === 'pending' && (
          <Pressable
            style={styles.actionBtn}
            onPress={() => navigation.navigate('PaymentScreen', { orderId: detail.orderId })}
          >
            <LinearGradient
              colors={[colors.gradientStart, colors.gradientEnd]}
              style={styles.actionBtnGradient}
            >
              <Ionicons name="card" size={20} color="#fff" />
              <Text style={styles.actionBtnText}>Thanh toán ngay</Text>
            </LinearGradient>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default OrderDetailScreen;

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
  errorText: {
    marginTop: spacing.md,
    ...typography.h4,
    color: colors.text,
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
    paddingBottom: spacing.xxl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  cardTitle: {
    ...typography.h4,
    color: colors.text,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  infoLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  infoValue: {
    ...typography.bodyBold,
    color: colors.text,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
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
  },
  productItem: {
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
  productDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  productTitle: {
    ...typography.bodyBold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  productQuantity: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  productPrice: {
    ...typography.h4,
    color: colors.primary,
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
    marginVertical: spacing.md,
  },
  summaryTotalLabel: {
    ...typography.h4,
    color: colors.text,
  },
  summaryTotalValue: {
    ...typography.h3,
    color: colors.primary,
  },
  actionBtn: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    marginTop: spacing.sm,
    ...shadows.lg,
  },
  actionBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  actionBtnText: {
    ...typography.bodyBold,
    color: '#fff',
  },
});
