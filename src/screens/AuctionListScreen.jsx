// src/screens/AuctionListScreen.jsx
import React, { useCallback, useState } from 'react';
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
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { auctionService } from '../services/auctionService';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, typography, shadows } from '../constants/theme';

const AuctionListScreen = () => {
  const navigation = useNavigation();
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Đảm bảo auctions luôn là array
  const safeAuctions = Array.isArray(auctions) ? auctions : [];

  // 🔹 Fetch auctions
  const fetchAuctions = async () => {
    try {
      setLoading(true);
      const list = await auctionService.getAllAuctions({ page: 1, limit: 30, status: 'live' });
      // Đảm bảo luôn là array
      const auctionsArray = Array.isArray(list) ? list : (list?.items ? list.items : []);
      setAuctions(auctionsArray);
    } catch (err) {
      console.error('❌ Fetch auctions error:', err);
      // Set empty array nếu có lỗi
      setAuctions([]);
      if (err?.response?.status === 401) {
        Alert.alert('Phiên đăng nhập hết hạn', 'Vui lòng đăng nhập lại.');
        navigation.replace('Login');
      } else {
        Alert.alert('Lỗi', 'Không thể tải danh sách đấu giá.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Refresh khi kéo xuống
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAuctions();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchAuctions();
    }, [])
  );

  // Format thời gian còn lại
  const formatTimeRemaining = (endTime) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end - now;
    if (diff <= 0) return 'Đã kết thúc';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 🔹 Gradient Header */}
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <Image
            source={require('../../assets/chargeX_Logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Đấu giá trực tuyến</Text>
            <Text style={styles.headerSubtitle}>Tham gia ngay để có cơ hội sở hữu sản phẩm yêu thích</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* 🔹 Section Header */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Ionicons name="flame" size={24} color={colors.error} />
            <Text style={styles.sectionTitle}>Phiên đấu giá đang diễn ra</Text>
          </View>
          <Text style={styles.auctionCount}>{safeAuctions.length} phiên</Text>
        </View>

        {/* 🔹 Danh sách auctions */}
        <View style={styles.grid}>
          {safeAuctions.length > 0 ? safeAuctions.map((auction) => {
            const productTitle = auction.product?.title || auction.title || 'Sản phẩm đấu giá';
            const currentPrice = auction.currentPrice || auction.startingPrice || 0;
            const imageUrl = auction.product?.imageUrls?.[0] || auction.imageUrls?.[0] || 'https://via.placeholder.com/200';
            
            // Backend trả về auctionId, không phải id
            const auctionId = auction.auctionId || auction.id;
            
            return (
              <View key={auctionId} style={styles.card}>
                {/* Image with overlay */}
                <Pressable
                  onPress={() => navigation.navigate('AuctionRoom', { auctionId })}
                >
                  <View style={styles.imageContainer}>
                    <Image style={styles.image} source={{ uri: imageUrl }} />
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.7)']}
                      style={styles.imageOverlay}
                    >
                      <View style={styles.liveBadge}>
                        <View style={styles.liveDot} />
                        <Text style={styles.liveText}>ĐANG DIỄN RA</Text>
                      </View>
                    </LinearGradient>
                  </View>
                </Pressable>

                <View style={styles.cardContent}>
                  <Pressable
                    onPress={() => navigation.navigate('AuctionRoom', { auctionId })}
                  >
                    <Text style={styles.title} numberOfLines={2}>
                      {productTitle}
                    </Text>
                    
                    <View style={styles.priceContainer}>
                      <Text style={styles.priceLabel}>Giá hiện tại</Text>
                      <Text style={styles.price}>
                        {parseFloat(currentPrice).toLocaleString('vi-VN')} ₫
                      </Text>
                    </View>

                  <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                      <View style={styles.statIconContainer}>
                        <Ionicons name="time" size={14} color={colors.error} />
                      </View>
                      <Text style={styles.statText} numberOfLines={1}>
                        {formatTimeRemaining(auction.endTime)}
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <View style={styles.statIconContainer}>
                        <Ionicons name="people" size={14} color={colors.primary} />
                      </View>
                      <Text style={styles.statText} numberOfLines={1}>
                        {auction.bidCount || 0} lượt
                      </Text>
                    </View>
                  </View>
                  </Pressable>

                  {/* Gradient Button với animation */}
                  <Pressable
                    onPress={() => navigation.navigate('AuctionRoom', { auctionId })}
                    style={styles.joinBtnContainer}
                  >
                    <LinearGradient
                      colors={[colors.gradientStart, colors.gradientEnd]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.joinBtn}
                    >
                      <Ionicons name="hammer" size={20} color="#fff" />
                      <Text style={styles.joinBtnText}>Tham gia ngay</Text>
                      <Ionicons name="arrow-forward" size={16} color="#fff" />
                    </LinearGradient>
                  </Pressable>
                </View>
              </View>
            );
          }) : null}

          {safeAuctions.length === 0 && !loading && (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="calendar-outline" size={80} color={colors.textLight} />
              </View>
              <Text style={styles.emptyTitle}>Chưa có phiên đấu giá</Text>
              <Text style={styles.emptyText}>
                Hãy quay lại sau để xem các phiên đấu giá mới
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AuctionListScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: spacing.md,
    paddingBottom: 80,
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
    alignItems: 'center',
  },
  logo: {
    width: 56,
    height: 56,
    marginRight: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: spacing.xs,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    ...typography.h2,
    color: '#fff',
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.9)',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
  },
  auctionCount: {
    ...typography.captionBold,
    color: colors.primary,
    backgroundColor: colors.primary + '15',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...shadows.md,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 160,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    justifyContent: 'flex-end',
    padding: spacing.sm,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    marginRight: spacing.xs,
  },
  liveText: {
    ...typography.small,
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cardContent: {
    padding: spacing.md,
  },
  title: {
    ...typography.bodyBold,
    color: colors.text,
    marginBottom: spacing.sm,
    minHeight: 44,
  },
  priceContainer: {
    marginBottom: spacing.sm,
  },
  priceLabel: {
    ...typography.small,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  price: {
    ...typography.h4,
    color: colors.primary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
  },
  statIconContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statText: {
    ...typography.small,
    color: colors.textSecondary,
    flex: 1,
  },
  joinBtnContainer: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    ...shadows.md,
  },
  joinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  joinBtnText: {
    ...typography.bodyBold,
    color: '#fff',
    fontSize: 14,
  },
  emptyContainer: {
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
