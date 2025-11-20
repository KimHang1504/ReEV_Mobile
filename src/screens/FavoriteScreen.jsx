// src/screens/FavoriteScreen.jsx
import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  Alert,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, borderRadius, typography, shadows } from '../constants/theme';

const FavoriteScreen = () => {
  const navigation = useNavigation();
  const [favorites, setFavorites] = useState([]);
  const [selected, setSelected] = useState([]);
  const [isMultiSelected, setIsMultiSelected] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFavorites = async () => {
    try {
      const storage = await AsyncStorage.getItem('favorites');
      if (storage) {
        const favList = JSON.parse(storage);
        setFavorites(Array.isArray(favList) ? favList : []);
      } else {
        setFavorites([]);
      }
    } catch (error) {
      console.error('Fetch favorites error:', error);
      setFavorites([]);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchFavorites();
      setIsMultiSelected(false);
      setSelected([]);
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFavorites();
    setRefreshing(false);
  };

  const handleToggleFavorites = async (item) => {
    try {
      let updatedFav;
      const isAddedToFav = favorites.some((fav) => fav.id === item.id);
      if (isAddedToFav) {
        updatedFav = favorites.filter((fav) => fav.id !== item.id);
      } else {
        updatedFav = [...favorites, item];
      }
      setFavorites(updatedFav);
      await AsyncStorage.setItem('favorites', JSON.stringify(updatedFav));
    } catch (error) {
      console.error('Toggle favorite error:', error);
    }
  };

  const handleToggleSelect = (item) => {
    const isSelected = selected.some((sel) => sel.id === item.id);
    if (isSelected) {
      setSelected(selected.filter((sel) => sel.id !== item.id));
    } else {
      setSelected([...selected, item]);
    }
  };

  const handleSelectAll = () => {
    if (selected.length === favorites.length) {
      setSelected([]);
    } else {
      setSelected([...favorites]);
    }
  };

  const handleRemove = async () => {
    if (selected.length === 0) {
      Alert.alert('Lỗi', 'Vui lòng chọn sản phẩm cần xóa.');
      return;
    }

    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc muốn xóa ${selected.length} sản phẩm khỏi danh sách yêu thích?`,
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              const selectedIds = selected.map((sel) => sel.id);
              const updatedFav = favorites.filter((fav) => !selectedIds.includes(fav.id));
              setFavorites(updatedFav);
              setSelected([]);
              setIsMultiSelected(false);
              await AsyncStorage.setItem('favorites', JSON.stringify(updatedFav));
            } catch (error) {
              console.error('Remove favorites error:', error);
            }
          },
        },
      ]
    );
  };

  const safeFavorites = Array.isArray(favorites) ? favorites : [];

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="heart" size={28} color="#fff" />
            <View>
              <Text style={styles.headerTitle}>Yêu thích</Text>
              <Text style={styles.headerSubtitle}>
                {safeFavorites.length} sản phẩm
              </Text>
            </View>
          </View>
          {safeFavorites.length > 0 && (
            <Pressable
              style={styles.editButton}
              onPress={() => setIsMultiSelected(!isMultiSelected)}
            >
              <Text style={styles.editButtonText}>
                {isMultiSelected ? 'Xong' : 'Chọn'}
              </Text>
            </Pressable>
          )}
        </View>
      </LinearGradient>

      {/* Action Bar */}
      {isMultiSelected && safeFavorites.length > 0 && (
        <View style={styles.actionBar}>
          <Pressable style={styles.actionButton} onPress={handleSelectAll}>
            <Text style={styles.actionButtonText}>
              {selected.length === safeFavorites.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
            </Text>
          </Pressable>
          <Pressable
            style={[styles.actionButton, styles.removeButton]}
            onPress={handleRemove}
            disabled={selected.length === 0}
          >
            <Ionicons name="trash" size={18} color="#fff" />
            <Text style={styles.actionButtonText}>
              Xóa ({selected.length})
            </Text>
          </Pressable>
        </View>
      )}

      {safeFavorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="heart-outline" size={80} color={colors.textLight} />
          </View>
          <Text style={styles.emptyTitle}>Chưa có sản phẩm yêu thích</Text>
          <Text style={styles.emptyText}>
            Thêm sản phẩm vào yêu thích để xem lại sau
          </Text>
          <Pressable
            style={styles.shopNowBtn}
            onPress={() => navigation.navigate('Home')}
          >
            <LinearGradient
              colors={[colors.gradientStart, colors.gradientEnd]}
              style={styles.shopNowBtnGradient}
            >
              <Text style={styles.shopNowText}>Khám phá sản phẩm</Text>
            </LinearGradient>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.container}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        >
          <View style={styles.grid}>
            {safeFavorites.map((item) => {
              const isSelected = selected.some((sel) => sel.id === item.id);
              const imageUrl = item.imageUrls?.[0] || item.uri || item.images?.[0] || 'https://via.placeholder.com/200';
              const title = item.title || item.handbagName || 'Sản phẩm';
              const price = item.price_buy_now || item.price || 0;

              return (
                <Pressable
                  key={item.id}
                  style={styles.card}
                  onPress={() => {
                    if (isMultiSelected) {
                      handleToggleSelect(item);
                    } else {
                      navigation.navigate('Detail', { productId: item.id });
                    }
                  }}
                >
                  {/* Image Container */}
                  <View style={styles.imageContainer}>
                    <Image source={{ uri: imageUrl }} style={styles.image} />
                    
                    {/* Favorite Badge */}
                    {!isMultiSelected && (
                      <Pressable
                        style={styles.favoriteBadge}
                        onPress={() => handleToggleFavorites(item)}
                      >
                        <Ionicons name="heart" size={20} color={colors.error} />
                      </Pressable>
                    )}

                    {/* Selection Checkbox */}
                    {isMultiSelected && (
                      <Pressable
                        style={styles.checkboxBadge}
                        onPress={() => handleToggleSelect(item)}
                      >
                        <Ionicons
                          name={isSelected ? 'checkbox' : 'checkbox-outline'}
                          size={24}
                          color={isSelected ? colors.primary : '#fff'}
                        />
                      </Pressable>
                    )}

                    {/* Selected Overlay */}
                    {isMultiSelected && isSelected && (
                      <View style={styles.selectedOverlay} />
                    )}
                  </View>

                  {/* Card Content */}
                  <View style={styles.cardContent}>
                    <Text style={styles.title} numberOfLines={2}>
                      {title}
                    </Text>
                    {price > 0 && (
                      <Text style={styles.price}>
                        {parseFloat(price).toLocaleString('vi-VN')} ₫
                      </Text>
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default FavoriteScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
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
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerTitle: {
    ...typography.h2,
    color: '#fff',
  },
  headerSubtitle: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.9)',
  },
  editButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: borderRadius.md,
  },
  editButtonText: {
    ...typography.bodyBold,
    color: '#fff',
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    gap: spacing.xs,
  },
  removeButton: {
    backgroundColor: colors.error,
  },
  actionButtonText: {
    ...typography.captionBold,
    color: '#fff',
  },
  container: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
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
    height: 200,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    backgroundColor: colors.divider,
  },
  favoriteBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  checkboxBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(24, 144, 255, 0.2)',
    borderWidth: 2,
    borderColor: colors.primary,
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
  },
  emptyContainer: {
    flex: 1,
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
    marginBottom: spacing.xl,
  },
  shopNowBtn: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    ...shadows.lg,
  },
  shopNowBtnGradient: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  shopNowText: {
    ...typography.bodyBold,
    color: '#fff',
  },
});
