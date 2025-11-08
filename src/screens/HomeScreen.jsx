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

  // 🔹 Fetch tất cả sản phẩm
  const fetchAllProducts = async () => {
    try {
      setLoading(true);

      const list = await productService.getAllListings({
        page: 1,
        limit: 30,
      });

      // ✅ Chỉ lấy sản phẩm đang bán
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
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* 🔹 Header với search */}
        <View style={styles.header}>
          <Text style={styles.appTitle}>⚡ ReEV Marketplace</Text>
          <Text style={styles.slogan}>Trao đổi & đấu giá pin xe điện cũ</Text>

          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={20} color="#666" />
            <TextInput
              placeholder="Tìm kiếm sản phẩm..."
              placeholderTextColor="#999"
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </View>

        {/* 🔹 Danh sách sản phẩm */}
        <View style={styles.grid}>
          {filteredItems.map((item) => (
            <Pressable
              key={item.id}
              onPress={() =>
                navigation.navigate('Detail', {
                  productId: item.id,
                })
              }
              style={styles.card}
            >
              <View style={styles.imageContainer}>
                <Image
                  style={styles.image}
                  source={{
                    uri:
                      item.imageUrls?.[0] ||
                      item.images?.[0] ||
                      'https://via.placeholder.com/200',
                  }}
                />
              </View>

              <View style={styles.info}>
                <Text style={styles.title} numberOfLines={2}>
                  {item.title || 'No title'}
                </Text>
                <Text style={styles.price}>
                  {item.price_buy_now
                    ? `${parseFloat(item.price_buy_now).toLocaleString()} ₫`
                    : '—'}
                </Text>
              </View>
            </Pressable>
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    padding: 16,
    backgroundColor: '#F8F9FB',
  },
  header: {
    marginBottom: 20,
    backgroundColor: '#E0F2FF',
    borderRadius: 16,
    padding: 16,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A237E',
  },
  slogan: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
    marginBottom: 10,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 44,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  searchInput: {
    flex: 1,
    marginLeft: 6,
    color: '#333',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 2,
  },
  imageContainer: {
    width: '100%',
    height: 140,
    backgroundColor: '#EEE',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  image: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  info: {
    padding: 10,
  },
  title: {
    fontWeight: '600',
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  price: {
    color: '#E53935',
    fontWeight: 'bold',
    fontSize: 15,
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
  },
});
