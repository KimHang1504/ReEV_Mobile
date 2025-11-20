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
  TextInput,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { productService } from '../services/productService';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, typography, shadows } from '../constants/theme';

const HomeScreen = () => {
  const navigation = useNavigation();
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch sản phẩm
  const fetchAllProducts = async () => {
    try {
      setLoading(true);
      const list = await productService.getAllListings({ page: 1, limit: 30 });
      const activeItems = (list || []).filter((p) => p.status === 'active');
      setItems(activeItems);
    } catch (err) {
      console.error('❌ Fetch products error:', err);
      if (err?.response?.status === 401) {
        Alert.alert('Phiên đăng nhập hết hạn', 'Vui lòng đăng nhập lại.');
        navigation.replace('Login');
      } else {
        Alert.alert('Lỗi', 'Không thể tải danh sách sản phẩm.');
      }
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAllProducts();
    }, [])
  );

  const filteredItems = items.filter((item) =>
    item.title?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4C6EF5" />
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
          <Image
            source={require('../../assets/chargeX_Logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={styles.headerIcons}>
            <Pressable
              style={styles.iconButton}
              onPress={() => navigation.navigate('Cart')}
            >
              <Ionicons name="cart" size={22} color="#fff" />
            </Pressable>
            <Pressable style={styles.iconButton}>
              <Ionicons name="notifications" size={22} color="#fff" />
              <View style={styles.dot} />
            </Pressable>
          </View>
        </View>

        {/* Search Box */}
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            placeholder="Tìm kiếm sản phẩm..."
            placeholderTextColor={colors.textLight}
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </Pressable>
          )}
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Ionicons name="flash" size={24} color={colors.secondary} />
            <Text style={styles.sectionTitle}>Sản phẩm nổi bật</Text>
          </View>
          <Text style={styles.productCount}>
            {filteredItems.length} sản phẩm
          </Text>
        </View>

        {/* 🔹 Danh sách sản phẩm */}
        <View style={styles.grid}>
          {filteredItems.map((item) => {
            const imageUrl = item.imageUrls?.[0] || item.images?.[0] || 'https://via.placeholder.com/200';
            const price = item.price_buy_now || 0;
            
            return (
              <Pressable
                key={item.id}
                style={styles.card}
                onPress={() => navigation.navigate('Detail', { productId: item.id })}
              >
                <View style={styles.imageContainer}>
                  <Image style={styles.image} source={{ uri: imageUrl }} />
                  {item.is_auction && (
                    <View style={styles.auctionBadge}>
                      <Ionicons name="hammer" size={12} color="#fff" />
                      <Text style={styles.auctionText}>AUCTION</Text>
                    </View>
                  )}
                </View>

                <View style={styles.cardContent}>
                  <Text style={styles.title} numberOfLines={2}>
                    {item.title || 'Sản phẩm'}
                  </Text>
                  <Text style={styles.price}>
                    {price > 0
                      ? `${parseFloat(price).toLocaleString('vi-VN')} ₫`
                      : 'Liên hệ'}
                  </Text>

                  <Pressable
                    style={styles.buyNowBtn}
                    onPress={() => navigation.navigate('Checkout', { product: item })}
                  >
                    <LinearGradient
                      colors={[colors.gradientStart, colors.gradientEnd]}
                      style={styles.buyNowBtnGradient}
                    >
                      <Ionicons name="flash" size={16} color="#fff" />
                      <Text style={styles.buyNowText}>Mua ngay</Text>
                    </LinearGradient>
                  </Pressable>
                </View>
              </Pressable>
            );
          })}

          {filteredItems.length === 0 && (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={80} color={colors.textLight} />
              <Text style={styles.emptyTitle}>Không tìm thấy sản phẩm</Text>
              <Text style={styles.emptyText}>
                Thử tìm kiếm với từ khóa khác
              </Text>
            </View>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;

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
  headerGradient: {
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  logo: {
    width: 120,
    height: 40,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  dot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 50,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.text,
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
  productCount: {
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
    backgroundColor: colors.divider,
  },
  auctionBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    gap: 4,
  },
  auctionText: {
    ...typography.small,
    color: '#fff',
    fontWeight: '700',
    fontSize: 10,
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
  price: {
    ...typography.h4,
    color: colors.primary,
    marginBottom: spacing.md,
  },
  buyNowBtn: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  buyNowBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  buyNowText: {
    ...typography.captionBold,
    color: '#fff',
  },
  emptyContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
