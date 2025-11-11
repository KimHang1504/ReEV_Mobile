// src/screens/AuctionRoomScreen.jsx
import React, { useState, useEffect, useContext } from 'react';
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
import { useNavigation, useRoute } from '@react-navigation/native';
import { auctionService } from '../services/auctionService';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../context/AuthContext';

const AuctionRoomScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { auctionId } = route.params || {};
  const { user } = useContext(AuthContext);

  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [placing, setPlacing] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');

  // 🔹 Fetch auction detail
  const fetchAuctionDetail = async () => {
    try {
      setLoading(true);
      const data = await auctionService.getAuctionById(auctionId);
      setAuction(data);
      // Set suggested bid amount
      const nextBid = (data.currentPrice || data.startingPrice || 0) + (data.minBidIncrement || data.minIncrement || 1000);
      setBidAmount(nextBid.toString());
    } catch (err) {
      console.error('❌ Fetch auction detail error:', err);
      Alert.alert('Lỗi', 'Không thể tải thông tin đấu giá.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auctionId) {
      fetchAuctionDetail();
    }
  }, [auctionId]);

  // 🔹 Countdown timer
  useEffect(() => {
    if (!auction?.endTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      const end = new Date(auction.endTime);
      const diff = end - now;

      if (diff <= 0) {
        setTimeRemaining('Đã kết thúc');
        clearInterval(interval);
        // Check if user won
        if (auction.winnerId === user?.sub) {
          Alert.alert(
            'Chúc mừng! 🎉',
            'Bạn đã thắng phiên đấu giá này. Vui lòng thanh toán để nhận sản phẩm.',
            [
              {
                text: 'Thanh toán ngay',
                onPress: () => {
                  // Navigate to payment with orderId (backend creates order when auction ends)
                  navigation.navigate('PaymentScreen', { 
                    auctionId: auction.id,
                    amount: auction.currentPrice || auction.startingPrice,
                  });
                },
              },
              { text: 'Để sau', style: 'cancel' },
            ]
          );
        }
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [auction, user]);

  // 🔹 Handle place bid
  const handlePlaceBid = async () => {
    const amount = parseFloat(bidAmount);
    if (!amount || isNaN(amount)) {
      Alert.alert('Lỗi', 'Vui lòng nhập số tiền hợp lệ.');
      return;
    }

    const currentPrice = auction?.currentPrice || auction?.startingPrice || 0;
    const minIncrement = auction?.minBidIncrement || auction?.minIncrement || 0;
    const minBid = currentPrice + minIncrement;

    if (amount < minBid) {
      Alert.alert('Lỗi', `Giá đặt tối thiểu là $${minBid.toLocaleString()}`);
      return;
    }

    try {
      setPlacing(true);
      await auctionService.placeBid(auctionId, amount);
      Alert.alert('Thành công!', 'Đặt giá thành công. Chúc bạn may mắn!');
      // Refresh auction detail
      await fetchAuctionDetail();
    } catch (err) {
      console.error('❌ Place bid error:', err);
      const errorMsg = err?.response?.data?.message || 'Không thể đặt giá. Vui lòng thử lại.';
      Alert.alert('Lỗi', errorMsg);
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4C6EF5" />
      </View>
    );
  }

  if (!auction) {
    return (
      <View style={styles.centered}>
        <Text>Không tìm thấy phiên đấu giá.</Text>
      </View>
    );
  }

  const productTitle = auction.product?.title || auction.title || 'Sản phẩm đấu giá';
  const currentPrice = auction.currentPrice || auction.startingPrice || 0;
  const imageUrl = auction.product?.imageUrls?.[0] || auction.imageUrls?.[0] || 'https://via.placeholder.com/400';
  const isEnded = auction.status === 'ended' || new Date(auction.endTime) <= new Date();
  const isWinner = auction.winnerId === user?.sub;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* 🔹 Product Image */}
        <Image style={styles.productImage} source={{ uri: imageUrl }} />

        {/* 🔹 Product Info */}
        <View style={styles.infoCard}>
          <Text style={styles.productTitle}>{productTitle}</Text>
          
          {auction.product?.description && (
            <Text style={styles.description} numberOfLines={3}>
              {auction.product.description}
            </Text>
          )}

          <View style={styles.divider} />

          {/* Current Price */}
          <View style={styles.priceRow}>
            <Text style={styles.label}>Giá hiện tại:</Text>
            <Text style={styles.currentPrice}>
              ${parseFloat(currentPrice).toLocaleString()}
            </Text>
          </View>

          {/* Time Remaining */}
          <View style={styles.timeRow}>
            <Ionicons name="time-outline" size={20} color="#FF6B6B" />
            <Text style={styles.timeText}>{timeRemaining}</Text>
          </View>

          {/* Bid Count */}
          <View style={styles.bidCountRow}>
            <Ionicons name="people-outline" size={20} color="#4C6EF5" />
            <Text style={styles.bidCountText}>
              {auction.bidCount || 0} lượt đặt giá
            </Text>
          </View>
        </View>

        {/* 🔹 Bidding Section */}
        {!isEnded ? (
          <View style={styles.biddingCard}>
            <Text style={styles.biddingTitle}>Đặt giá của bạn</Text>
            <View style={styles.inputRow}>
              <Text style={styles.dollarSign}>$</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="Nhập số tiền"
                value={bidAmount}
                onChangeText={setBidAmount}
              />
            </View>
            <Text style={styles.hintText}>
              Giá đặt tối thiểu: $
              {(currentPrice + (auction.minBidIncrement || auction.minIncrement || 0)).toLocaleString()}
            </Text>
            <Pressable
              style={[styles.bidBtn, placing && styles.bidBtnDisabled]}
              onPress={handlePlaceBid}
              disabled={placing}
            >
              {placing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="hammer-outline" size={20} color="#fff" />
                  <Text style={styles.bidBtnText}>Đặt giá ngay</Text>
                </>
              )}
            </Pressable>
          </View>
        ) : (
          <View style={styles.endedCard}>
            <Ionicons name="checkmark-circle" size={60} color="#4CAF50" />
            <Text style={styles.endedTitle}>Phiên đấu giá đã kết thúc</Text>
            {isWinner ? (
              <>
                <Text style={styles.winnerText}>
                  🎉 Chúc mừng! Bạn đã thắng phiên đấu giá này.
                </Text>
                <Pressable
                  style={styles.paymentBtn}
                  onPress={() =>
                    navigation.navigate('PaymentScreen', {
                      auctionId: auction.id,
                      amount: currentPrice,
                    })
                  }
                >
                  <Text style={styles.paymentBtnText}>Thanh toán ngay</Text>
                </Pressable>
              </>
            ) : (
              <Text style={styles.loserText}>
                Rất tiếc, bạn không thắng phiên đấu giá này.
              </Text>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default AuctionRoomScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  container: {
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImage: {
    width: '100%',
    height: 300,
    backgroundColor: '#E0E0E0',
  },
  infoCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginTop: -30,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 4,
  },
  productTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A237E',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  currentPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4C6EF5',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeText: {
    fontSize: 14,
    color: '#FF6B6B',
    marginLeft: 8,
    fontWeight: '600',
  },
  bidCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bidCountText: {
    fontSize: 14,
    color: '#4C6EF5',
    marginLeft: 8,
  },
  biddingCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 4,
  },
  biddingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A237E',
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4C6EF5',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  dollarSign: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4C6EF5',
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  hintText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  bidBtn: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bidBtnDisabled: {
    backgroundColor: '#ccc',
  },
  bidBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  endedCard: {
    backgroundColor: '#fff',
    padding: 24,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 4,
  },
  endedTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A237E',
    marginTop: 12,
    marginBottom: 8,
  },
  winnerText: {
    fontSize: 14,
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '600',
  },
  loserText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  paymentBtn: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  paymentBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
