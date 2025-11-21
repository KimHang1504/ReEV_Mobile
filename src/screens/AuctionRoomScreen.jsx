// src/screens/AuctionRoomScreen.jsx
import React, { useState, useEffect, useContext, useRef } from 'react';
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
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { auctionService } from '../services/auctionService';
import { socketService } from '../services/socketService';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../context/AuthContext';
import { colors, spacing, borderRadius, typography, shadows } from '../constants/theme';

const { width } = Dimensions.get('window');

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
  const [isConnected, setIsConnected] = useState(false);
  const socketConnectedRef = useRef(false);

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

  // 🔹 Connect to socket and join auction room
  useEffect(() => {
    if (!auctionId || !user?.sub) return;

    const connectSocket = async () => {
      try {
        await socketService.connect(user.sub);
        socketService.joinAuction(auctionId);
        setIsConnected(true);
        socketConnectedRef.current = true;

        // Listen for auction state updates
        socketService.onAuctionState((state) => {
          console.log('[AuctionRoom] Received state:', state);
          setAuction((prev) => ({
            ...prev,
            ...state,
            currentPrice: state.currentPrice || prev?.currentPrice,
            endTime: state.endTime || prev?.endTime,
          }));
        });

        // Listen for price updates
        socketService.onPriceUpdate((update) => {
          console.log('[AuctionRoom] Price update:', update);
          setAuction((prev) => ({
            ...prev,
            currentPrice: update.currentPrice,
            endTime: update.endTime,
            winnerId: update.winnerId,
          }));
          // Refresh auction detail
          fetchAuctionDetail();
        });

        // Listen for auction extended
        socketService.onAuctionExtended((data) => {
          console.log('[AuctionRoom] Auction extended:', data);
          setAuction((prev) => ({
            ...prev,
            endTime: data.endTime,
          }));
        });

        // Listen for errors
        socketService.onError((error) => {
          console.error('[AuctionRoom] Socket error:', error);
          Alert.alert('Lỗi', error.message || 'Có lỗi xảy ra');
        });
      } catch (err) {
        console.error('[AuctionRoom] Socket connection error:', err);
        // Fallback to REST API if socket fails
      }
    };

    connectSocket();

    return () => {
      if (socketConnectedRef.current) {
        socketService.leaveAuction(auctionId);
        socketService.removeAllListeners();
        socketService.disconnect();
        socketConnectedRef.current = false;
      }
    };
  }, [auctionId, user?.sub]);

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
                onPress: async () => {
                  try {
                    // Fetch order ID from backend before navigating to payment
                    const order = await auctionService.getOrderByAuctionId(auction.id);
                    if (order && order.orderId) {
                      navigation.navigate('PaymentScreen', {
                        orderId: order.orderId,
                        auctionId: auction.id,
                        amount: auction.currentPrice || auction.startingPrice,
                        productTitle: auction.product?.title || auction.title,
                      });
                    } else {
                      Alert.alert('Lỗi', 'Không thể tìm thấy thông tin đơn hàng. Vui lòng thử lại sau.');
                    }
                  } catch (err) {
                    console.error('❌ Error fetching order:', err);
                    Alert.alert('Lỗi', 'Không thể lấy thông tin thanh toán. Vui lòng thử lại.');
                  }
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

  // 🔹 Handle place bid - use socket if connected, otherwise REST API
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
      Alert.alert('Lỗi', `Giá đặt tối thiểu là ${minBid.toLocaleString()} ₫`);
      return;
    }

    try {
      setPlacing(true);
      
      // Use socket if connected, otherwise fallback to REST API
      if (socketService.isConnected()) {
        const clientBidId = `bid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        socketService.placeBid(auctionId, amount, clientBidId);
        // Socket will emit price_update event, no need to show alert immediately
        // Wait for server confirmation via socket events
      } else {
        // Fallback to REST API
        await auctionService.placeBid(auctionId, amount);
        Alert.alert('Thành công!', 'Đặt giá thành công. Chúc bạn may mắn!');
        await fetchAuctionDetail();
      }
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
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Đang tải phiên đấu giá...</Text>
      </View>
    );
  }

  if (!auction) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={60} color={colors.error} />
        <Text style={styles.errorText}>Không tìm thấy phiên đấu giá</Text>
      </View>
    );
  }

  const productTitle = auction.product?.title || auction.title || 'Sản phẩm đấu giá';
  const currentPrice = auction.currentPrice || auction.startingPrice || 0;
  const imageUrl = auction.product?.imageUrls?.[0] || auction.imageUrls?.[0] || 'https://via.placeholder.com/400';
  const isEnded = auction.status === 'ended' || new Date(auction.endTime) <= new Date();
  const isWinner = auction.winnerId === user?.sub;
  const minBid = currentPrice + (auction.minBidIncrement || auction.minIncrement || 1000);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header với back button */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <View style={styles.headerCenter}>
          <View style={[styles.statusIndicator, { backgroundColor: isEnded ? colors.textSecondary : colors.error }]}>
            <View style={[styles.statusDot, { backgroundColor: isEnded ? colors.textSecondary : colors.error }]} />
          </View>
          <Text style={styles.headerTitle}>
            {isEnded ? 'Đã kết thúc' : 'Đang diễn ra'}
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Product Image với gradient overlay */}
        <View style={styles.imageContainer}>
          <Image style={styles.productImage} source={{ uri: imageUrl }} />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.3)']}
            style={styles.imageGradient}
          >
            {!isEnded && (
              <View style={styles.liveIndicator}>
                <View style={styles.livePulse} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            )}
          </LinearGradient>
        </View>

        {/* Product Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.productTitle}>{productTitle}</Text>
          
          {auction.product?.description && (
            <Text style={styles.description} numberOfLines={3}>
              {auction.product.description}
            </Text>
          )}

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="cash" size={24} color={colors.primary} />
              <Text style={styles.statLabel}>Giá hiện tại</Text>
              <Text style={styles.statValue}>
                {parseFloat(currentPrice).toLocaleString('vi-VN')} ₫
              </Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="time" size={24} color={colors.error} />
              <Text style={styles.statLabel}>Còn lại</Text>
              <Text style={[styles.statValue, styles.timeValue]}>
                {timeRemaining}
              </Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="people" size={24} color={colors.secondary} />
              <Text style={styles.statLabel}>Lượt đặt</Text>
              <Text style={styles.statValue}>
                {auction.bidCount || 0}
              </Text>
            </View>
          </View>

          {/* Connection Status */}
          <View style={styles.connectionBadge}>
            <Ionicons 
              name={isConnected ? "wifi" : "wifi-outline"} 
              size={16} 
              color={isConnected ? colors.success : colors.error} 
            />
            <Text style={[styles.connectionText, { color: isConnected ? colors.success : colors.error }]}>
              {isConnected ? "Kết nối real-time" : "Đang kết nối..."}
            </Text>
          </View>
        </View>

        {/* 🔹 Bidding Section */}
        {!isEnded ? (
          <View style={styles.biddingCard}>
            <View style={styles.biddingHeader}>
              <Ionicons name="hammer" size={28} color={colors.secondary} />
              <Text style={styles.biddingTitle}>Đặt giá của bạn</Text>
            </View>

            {/* Price Input */}
            <View style={styles.inputContainer}>
              <View style={styles.currencyBadge}>
                <Text style={styles.currency}>₫</Text>
              </View>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder={minBid.toLocaleString('vi-VN')}
                placeholderTextColor={colors.textLight}
                value={bidAmount}
                onChangeText={setBidAmount}
              />
            </View>

            <View style={styles.minBidInfo}>
              <Ionicons name="information-circle-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.hintText}>
                Giá đặt tối thiểu: <Text style={styles.hintBold}>{minBid.toLocaleString('vi-VN')} ₫</Text>
              </Text>
            </View>

            {/* Place Bid Button */}
            <Pressable
              style={styles.bidBtn}
              onPress={handlePlaceBid}
              disabled={placing || !isConnected}
            >
              <LinearGradient
                colors={[colors.gradientStart, colors.gradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.bidBtnGradient, (placing || !isConnected) && styles.bidBtnDisabled]}
              >
                {placing ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="hammer" size={22} color="#fff" />
                    <Text style={styles.bidBtnText}>Đặt giá ngay</Text>
                  </>
                )}
              </LinearGradient>
            </Pressable>

            {!isConnected && (
              <Text style={styles.connectionWarning}>
                ⚠️ Đang kết nối... Vui lòng chờ
              </Text>
            )}
          </View>
        ) : (
          <View style={styles.endedCard}>
            <LinearGradient
              colors={[colors.success + '20', colors.success + '10']}
              style={styles.endedCardGradient}
            >
              <View style={styles.endedIconContainer}>
                <Ionicons name="checkmark-circle" size={80} color={isWinner ? colors.success : colors.textSecondary} />
              </View>
              <Text style={styles.endedTitle}>
                Phiên đấu giá đã kết thúc
              </Text>
              <Text style={styles.finalPrice}>
                Giá cuối cùng: {parseFloat(currentPrice).toLocaleString('vi-VN')} ₫
              </Text>
              
              {isWinner ? (
                <>
                  <View style={styles.winnerBadge}>
                    <Ionicons name="trophy" size={24} color={colors.warning} />
                    <Text style={styles.winnerText}>
                      🎉 Chúc mừng! Bạn đã thắng!
                    </Text>
                  </View>
                  <Pressable
                    style={styles.paymentBtn}
                    onPress={() =>
                      navigation.navigate('PaymentScreen', {
                        auctionId: auction.id,
                        amount: currentPrice,
                      })
                    }
                  >
                    <LinearGradient
                      colors={[colors.success, colors.success + 'DD']}
                      style={styles.paymentBtnGradient}
                    >
                      <Ionicons name="card" size={20} color="#fff" />
                      <Text style={styles.paymentBtnText}>Thanh toán ngay</Text>
                    </LinearGradient>
                  </Pressable>
                </>
              ) : (
                <Text style={styles.loserText}>
                  Rất tiếc, bạn không thắng phiên đấu giá này.
                </Text>
              )}
            </LinearGradient>
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
    backgroundColor: colors.background,
  },
  container: {
    paddingBottom: spacing.xxl,
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  headerTitle: {
    ...typography.bodyBold,
    color: colors.text,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 350,
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    backgroundColor: colors.divider,
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    justifyContent: 'flex-end',
    padding: spacing.md,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.error,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    gap: spacing.xs,
  },
  livePulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  liveText: {
    ...typography.small,
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 1,
  },
  infoCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginTop: -spacing.xl,
    borderRadius: borderRadius.lg,
    ...shadows.lg,
  },
  productTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statLabel: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  statValue: {
    ...typography.h4,
    color: colors.primary,
    fontWeight: '700',
  },
  timeValue: {
    color: colors.error,
    fontSize: 14,
  },
  connectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    gap: spacing.xs,
  },
  connectionText: {
    ...typography.small,
    fontWeight: '600',
  },
  biddingCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.lg,
  },
  biddingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  biddingTitle: {
    ...typography.h3,
    color: colors.text,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.primary,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  currencyBadge: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  currency: {
    ...typography.h4,
    color: '#fff',
  },
  input: {
    flex: 1,
    height: 60,
    ...typography.h3,
    color: colors.text,
  },
  minBidInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  hintText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  hintBold: {
    ...typography.captionBold,
    color: colors.primary,
  },
  bidBtn: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    ...shadows.lg,
  },
  bidBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  bidBtnDisabled: {
    opacity: 0.6,
  },
  bidBtnText: {
    ...typography.bodyBold,
    color: '#fff',
  },
  connectionWarning: {
    ...typography.caption,
    color: colors.warning,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  endedCard: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.lg,
  },
  endedCardGradient: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  endedIconContainer: {
    marginBottom: spacing.md,
  },
  endedTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  finalPrice: {
    ...typography.h4,
    color: colors.primary,
    marginBottom: spacing.md,
    fontWeight: '700',
  },
  winnerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  winnerText: {
    ...typography.bodyBold,
    color: colors.warning,
  },
  loserText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  paymentBtn: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    ...shadows.lg,
  },
  paymentBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  paymentBtnText: {
    ...typography.bodyBold,
    color: '#fff',
  },
});
