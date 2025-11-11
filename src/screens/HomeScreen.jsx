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
import { productService } from '../services/productService';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

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
      <ScrollView contentContainerStyle={styles.container}>

        <View style={styles.header}>
          <Image
            source={require('../../assets/chargeX_Logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          <View style={styles.headerIcons}>
            <Pressable style={styles.iconButton}>
              <Ionicons name="cart-outline" size={20} color="#007AFF" />
            </Pressable>
            <Pressable style={styles.iconButton}>
              <Ionicons name="notifications-outline" size={20} color="#007AFF" />
              <View style={styles.dot} />
            </Pressable>
          </View>
        </View>

        {/* 🔹 Ô tìm kiếm */}
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={20} color="#666" />
          <TextInput
            placeholder="Tìm kiếm sản phẩm..."
            placeholderTextColor="#999"
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
          />
          <Ionicons name="options-outline" size={20} color="#007AFF" />
        </View>

        {/* 🔹 Tiêu đề */}
        <Text style={styles.sectionTitle}>Sản phẩm nổi bật</Text>

        {/* 🔹 Danh sách sản phẩm */}
        <View style={styles.grid}>
          {filteredItems.map((item) => (
            <View key={item.id} style={styles.card}>
              <Pressable
                onPress={() =>
                  navigation.navigate('Detail', { productId: item.id })
                }
              >
                <Image
                  style={styles.image}
                  source={{
                    uri:
                      item.imageUrls?.[0] ||
                      item.images?.[0] ||
                      'https://via.placeholder.com/200',
                  }}
                />
                <View style={styles.info}>
                  <Text style={styles.title} numberOfLines={2}>
                    {item.title || 'No title'}
                  </Text>
                  <Text style={styles.price}>
                    {item.price_buy_now
                      ? `$${parseFloat(item.price_buy_now).toLocaleString()}`
                      : '—'}
                  </Text>
                </View>
              </Pressable>

              {/* 🔹 Nút MUA NGAY */}
              <Pressable
                style={styles.buyNowBtn}
                onPress={() => navigation.navigate('PaymentScreen', { product: item })}
              >
                <Text style={styles.buyNowText}>Mua ngay</Text>
              </Pressable>
            </View>
          ))}

          {filteredItems.length === 0 && (
            <Text style={styles.emptyText}>Không có sản phẩm nào phù hợp.</Text>
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
    backgroundColor: '#fff', // ❌ bỏ màu xanh
  },
  container: {
    padding: 16,
    paddingBottom: 80,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  // 🔹 Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  locationLabel: {
    fontSize: 12,
    color: '#888',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  locationText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#007AFF',
    marginHorizontal: 4,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    backgroundColor: '#F3F8FF',
    padding: 8,
    borderRadius: 10,
    position: 'relative',
  },
  dot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'red',
  },
  // 🔍 Search box
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    marginHorizontal: 8,
    color: '#333',
    fontSize: 15,
  },
  // Danh sách sản phẩm
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A237E',
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  card: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    minHeight: 250, // ✅ Chiều cao cố định cho đồng bộ
  },

  image: {
    width: '100%',
    height: 130,
  },
  info: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 90, // ✅ Giữ khối info cao đều
  },

  title: {
    fontWeight: '700',       // ✅ In đậm
    fontSize: 16,            // ✅ To hơn giá
    color: '#222',
    marginBottom: 6,
    textAlign: 'center',
    height: 42,              // ✅ Cố định chiều cao dòng tên (2 dòng)
    lineHeight: 21,          // Cân đối khoảng cách giữa 2 dòng
  },

  price: {
    color: '#777',           // ✅ Màu xám
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },



  buyNowBtn: {
    backgroundColor: '#28a745', // xanh lá nhẹ
    paddingVertical: 8,
    marginHorizontal: 10,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyNowText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },

  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
    fontStyle: 'italic',
  },
  logo: {
  width: 120,
  height: 40, 
  marginLeft: -50,
},
});
