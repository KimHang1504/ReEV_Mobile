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
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { auctionService } from '../services/auctionService';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const AuctionListScreen = () => {
  const navigation = useNavigation();
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 🔹 Fetch auctions
  const fetchAuctions = async () => {
    try {
      setLoading(true);
      const list = await auctionService.getAllAuctions({ page: 1, limit: 30, status: 'live' });
      setAuctions(list || []);
    } catch (err) {
      console.error('❌ Fetch auctions error:', err);
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
        <ActivityIndicator size="large" color="#4C6EF5" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* 🔹 Header */}
        <View style={styles.header}>
          <Image
            source={require('../../assets/chargeX_Logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.headerTitle}>Đấu giá trực tuyến</Text>
        </View>

        {/* 🔹 Tiêu đề */}
        <Text style={styles.sectionTitle}>Phiên đấu giá đang diễn ra</Text>

        {/* 🔹 Danh sách auctions */}
        <View style={styles.grid}>
          {auctions.map((auction) => {
            const productTitle = auction.product?.title || auction.title || 'Sản phẩm đấu giá';
            const currentPrice = auction.currentPrice || auction.startingPrice || 0;
            const imageUrl = auction.product?.imageUrls?.[0] || auction.imageUrls?.[0] || 'https://via.placeholder.com/200';
            
            return (
              <View key={auction.id} style={styles.card}>
                <Pressable
                  onPress={() =>
                    navigation.navigate('AuctionRoom', { auctionId: auction.id })
                  }
                >
                  <Image
                    style={styles.image}
                    source={{ uri: imageUrl }}
                  />
                  <View style={styles.info}>
                    <Text style={styles.title} numberOfLines={2}>
                      {productTitle}
                    </Text>
                    <View style={styles.priceRow}>
                      <Text style={styles.label}>Giá hiện tại:</Text>
                      <Text style={styles.price}>
                        ${parseFloat(currentPrice).toLocaleString()}
                      </Text>
                    </View>
                    <View style={styles.statusRow}>
                      <Ionicons name="time-outline" size={16} color="#FF6B6B" />
                      <Text style={styles.timeText}>
                        {formatTimeRemaining(auction.endTime)}
                      </Text>
                    </View>
                    <View style={styles.bidCountRow}>
                      <Ionicons name="people-outline" size={16} color="#4C6EF5" />
                      <Text style={styles.bidCountText}>
                        {auction.bidCount || 0} lượt đặt giá
                      </Text>
                    </View>
                  </View>
                </Pressable>

                {/* 🔹 Nút THAM GIA ĐẤU GIÁ */}
                <Pressable
                  style={styles.joinBtn}
                  onPress={() =>
                    navigation.navigate('AuctionRoom', { auctionId: auction.id })
                  }
                >
                  <Ionicons name="hammer-outline" size={18} color="#fff" />
                  <Text style={styles.joinBtnText}>Tham gia đấu giá</Text>
                </Pressable>
              </View>
            );
          })}

          {auctions.length === 0 && (
            <View style={styles.emptyContainer}>
              <Ionicons name="sad-outline" size={60} color="#ccc" />
              <Text style={styles.emptyText}>Chưa có phiên đấu giá nào.</Text>
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
    backgroundColor: '#fff',
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 50,
    height: 50,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A237E',
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
    fontWeight: '700',
    fontSize: 15,
    color: '#222',
    marginBottom: 8,
    height: 38,
    lineHeight: 19,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 12,
    color: '#666',
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4C6EF5',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#FF6B6B',
    marginLeft: 4,
    fontWeight: '600',
  },
  bidCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bidCountText: {
    fontSize: 12,
    color: '#4C6EF5',
    marginLeft: 4,
  },
  joinBtn: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 10,
    marginHorizontal: 10,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  joinBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    marginLeft: 6,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 12,
    fontStyle: 'italic',
  },
});
