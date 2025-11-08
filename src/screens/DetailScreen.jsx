import React, { useEffect, useState } from 'react';
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
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { productService } from '../services/productService';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const DetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { productId } = route.params || {};
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

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
    if (productId) fetchProduct();
  }, [productId]);

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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={styles.container}>
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
          {(imageUrls && imageUrls.length > 0 ? imageUrls : ['https://via.placeholder.com/400']).map(
            (url, i) => (
              <Image key={i} source={{ uri: url }} style={styles.image} />
            )
          )}
        </ScrollView>

        <View style={styles.body}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.price}>
            {price_buy_now
              ? `${parseFloat(price_buy_now).toLocaleString()} ₫`
              : 'Giá đang cập nhật'}
          </Text>

          {price_start && (
            <Text style={styles.subPrice}>
              Giá khởi điểm: {parseFloat(price_start).toLocaleString()} ₫
            </Text>
          )}

          <Text style={styles.section}>Mô tả</Text>
          <Text style={styles.description}>{description || 'Không có mô tả.'}</Text>

          {seller && (
            <View style={styles.sellerBox}>
              <Ionicons name="person-circle-outline" size={24} color="#007AFF" />
              <View style={{ marginLeft: 8 }}>
                <Text style={styles.sellerName}>{seller.fullName}</Text>
                <Text style={styles.sellerLabel}>Người bán</Text>
              </View>
            </View>
          )}

          <Pressable
            style={styles.buyButton}
            onPress={() => navigation.navigate('PaymentScreen', { product })}
          >
            <Ionicons name="cart-outline" size={20} color="#fff" />
            <Text style={styles.buyButtonText}>Mua ngay</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>

  );
};

export default DetailScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8F9FB',
    paddingBottom: 40,
  },
  image: {
    width,
    height: 280,
  },
  body: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
  },
  price: {
    fontSize: 18,
    color: '#E53935',
    fontWeight: 'bold',
    marginTop: 4,
  },
  subPrice: {
    color: '#666',
    marginBottom: 10,
  },
  section: {
    fontWeight: '700',
    fontSize: 16,
    marginTop: 20,
  },
  description: {
    color: '#444',
    lineHeight: 20,
  },
  sellerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginTop: 20,
    padding: 10,
    borderRadius: 10,
    elevation: 1,
  },
  sellerName: {
    fontWeight: '600',
    color: '#333',
  },
  sellerLabel: {
    color: '#777',
    fontSize: 13,
  },
  buyButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 24,
  },
  buyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
