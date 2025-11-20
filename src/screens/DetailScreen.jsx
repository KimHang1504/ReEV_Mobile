import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { productService } from '../services/productService';
import { orderService } from '../services/orderService';
import { addressService } from '../services/addressService';
import { useAuth } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, borderRadius, typography, shadows } from '../constants/theme';

const { width } = Dimensions.get('window');

const DetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { productId } = route.params || {};
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const data = await productService.getDetail(productId);
      setProduct(data);
    } catch (err) {
      console.error('❌ Fetch product detail error:', err);
      Alert.alert('Lỗi', 'Không thể tải chi tiết sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchProduct();
      checkFavorite();
      checkInCart();
    }
  }, [productId]);

  // 🔹 Check if product is favorite
  const checkFavorite = async () => {
    try {
      const favorites = await AsyncStorage.getItem('favorites');
      if (favorites) {
        const favList = JSON.parse(favorites);
        setIsFavorite(favList.some((fav) => fav.id === productId));
      }
    } catch (err) {
      console.error('Check favorite error:', err);
    }
  };

  // 🔹 Toggle favorite
  const handleToggleFavorite = async () => {
    try {
      const favorites = await AsyncStorage.getItem('favorites');
      let favList = favorites ? JSON.parse(favorites) : [];
      
      if (isFavorite) {
        favList = favList.filter((fav) => fav.id !== productId);
      } else {
        favList.push({ id: productId, ...product });
      }
      
      await AsyncStorage.setItem('favorites', JSON.stringify(favList));
      setIsFavorite(!isFavorite);
    } catch (err) {
      console.error('Toggle favorite error:', err);
    }
  };

  // 🔹 Check if product is in cart
  const checkInCart = async () => {
    try {
      if (!user?.sub) return;
      const { items: orders } = await orderService.getOrdersByBuyer(user.sub, {
        status: 'pending',
        page: 1,
        limit: 100,
      });
      const inCart = orders.some((order) =>
        order.orderShops?.some((shop) =>
          shop.orderDetails?.some((detail) => detail.product?.id === productId)
        )
      );
      setIsInCart(inCart);
    } catch (err) {
      console.error('Check cart error:', err);
    }
  };

  // 🔹 Add to cart
  const handleAddToCart = async () => {
    if (!user?.sub) {
      Alert.alert('Lỗi', 'Vui lòng đăng nhập để thêm vào giỏ hàng.');
      return;
    }

    try {
      setAddingToCart(true);
      const addresses = await addressService.getMyAddresses();
      if (addresses.length === 0) {
        Alert.alert(
          'Lỗi',
          'Vui lòng thêm địa chỉ giao hàng trước.',
          [
            { text: 'Hủy', style: 'cancel' },
            {
              text: 'Thêm địa chỉ',
              onPress: () => navigation.navigate('AddressManagement'),
            },
          ]
        );
        return;
      }

      const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
      const payload = {
        receiverName: defaultAddr.fullName,
        receiverPhone: defaultAddr.phone,
        receiverAddress: defaultAddr.line1,
        receiverDistrictId: defaultAddr.districtId,
        receiverWardCode: defaultAddr.wardCode,
        receiverAddressId: defaultAddr.addressId,
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

      await orderService.createOrder(user.sub, payload);
      Alert.alert('Thành công', 'Đã thêm vào giỏ hàng!');
      setIsInCart(true);
      navigation.navigate('Cart');
    } catch (err) {
      console.error('Add to cart error:', err);
      Alert.alert('Lỗi', err.response?.data?.message || 'Không thể thêm vào giỏ hàng.');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.centered}>
        <Text>Không tìm thấy sản phẩm</Text>
      </View>
    );
  }

  const {
    title,
    description,
    price_buy_now,
    price_start,
    imageUrls,
    seller,
  } = product;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header với favorite button */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Pressable onPress={handleToggleFavorite} style={styles.favoriteButton}>
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={24}
            color={isFavorite ? colors.error : colors.text}
          />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Image Gallery */}
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
          {(imageUrls && imageUrls.length > 0
            ? imageUrls
            : ['https://via.placeholder.com/400']
          ).map((url, i) => (
            <Image key={i} source={{ uri: url }} style={styles.image} />
          ))}
        </ScrollView>

        <View style={styles.body}>
          <Text style={styles.title}>{title}</Text>

          <View style={styles.priceContainer}>
            <Text style={styles.price}>
              {price_buy_now
                ? `${parseFloat(price_buy_now).toLocaleString('vi-VN')} ₫`
                : 'Giá đang cập nhật'}
            </Text>
            {price_start && (
              <Text style={styles.subPrice}>
                Giá khởi điểm: {parseFloat(price_start).toLocaleString('vi-VN')} ₫
              </Text>
            )}
          </View>

          {product.is_auction && (
            <View style={styles.auctionBadge}>
              <Ionicons name="hammer" size={16} color={colors.secondary} />
              <Text style={styles.auctionText}>Sản phẩm đấu giá</Text>
            </View>
          )}

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Mô tả sản phẩm</Text>
          <Text style={styles.description}>{description || 'Không có mô tả.'}</Text>

          {seller && (
            <View style={styles.sellerBox}>
              <Ionicons name="storefront" size={24} color={colors.primary} />
              <View style={styles.sellerInfo}>
                <Text style={styles.sellerName}>{seller.fullName}</Text>
                <Text style={styles.sellerLabel}>Người bán</Text>
              </View>
              <Pressable
                onPress={() => navigation.navigate('ShopDetail', { sellerId: seller.userId })}
              >
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </Pressable>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {!isInCart ? (
              <Pressable
                style={styles.addToCartBtn}
                onPress={handleAddToCart}
                disabled={addingToCart}
              >
                {addingToCart ? (
                  <ActivityIndicator color={colors.primary} />
                ) : (
                  <>
                    <Ionicons name="cart-outline" size={20} color={colors.primary} />
                    <Text style={styles.addToCartText}>Thêm vào giỏ hàng</Text>
                  </>
                )}
              </Pressable>
            ) : (
              <Pressable
                style={styles.inCartBtn}
                onPress={() => navigation.navigate('Cart')}
              >
                <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                <Text style={styles.inCartText}>Đã có trong giỏ hàng</Text>
              </Pressable>
            )}

            <Pressable
              style={styles.buyNowBtn}
              onPress={() => navigation.navigate('Checkout', { product })}
            >
              <LinearGradient
                colors={[colors.gradientStart, colors.gradientEnd]}
                style={styles.buyNowBtnGradient}
              >
                <Ionicons name="flash" size={20} color="#fff" />
                <Text style={styles.buyNowText}>Mua ngay</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DetailScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    paddingBottom: 100,
  },
  image: {
    width,
    height: 350,
    backgroundColor: colors.divider,
  },
  body: {
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  priceContainer: {
    marginBottom: spacing.md,
  },
  price: {
    ...typography.h3,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  subPrice: {
    ...typography.body,
    color: colors.textSecondary,
  },
  auctionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.secondary + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  auctionText: {
    ...typography.captionBold,
    color: colors.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.md,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  sellerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  sellerInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  sellerName: {
    ...typography.bodyBold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  sellerLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  actionButtons: {
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  addToCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  addToCartText: {
    ...typography.bodyBold,
    color: colors.primary,
  },
  inCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success + '20',
    borderWidth: 2,
    borderColor: colors.success,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  inCartText: {
    ...typography.bodyBold,
    color: colors.success,
  },
  buyNowBtn: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    ...shadows.lg,
  },
  buyNowBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  buyNowText: {
    ...typography.bodyBold,
    color: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
