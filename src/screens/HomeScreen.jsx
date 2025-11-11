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
        {/* 🔹 Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcome}>Xin chào</Text>
            <Text style={styles.subtitle}>Khám phá pin xe điện đã qua sử dụng</Text>
          </View>
          <Ionicons name="person-circle-outline" size={38} color="#4C6EF5" />
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
        </View>

        {/* 🔹 Tiêu đề */}
        <Text style={styles.sectionTitle}>Sản phẩm nổi bật</Text>

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
  safeArea: {
    flex: 1,
    backgroundColor: '#E0F2FF',
  },
  container: {
    padding: 16,
    paddingBottom: 80,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E0F2FF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  welcome: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A237E',
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
    marginTop: 2,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    borderWidth: 1,
    borderColor: '#CCE0FF',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: '#333',
    fontSize: 15,
  },
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
  },
  image: {
    width: '100%',
    height: 130,
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
    color: '#4C6EF5',
    fontWeight: '700',
    fontSize: 15,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
    fontStyle: 'italic',
  },
});
