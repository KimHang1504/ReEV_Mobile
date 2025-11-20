// src/screens/AddressManagementScreen.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { addressService } from '../services/addressService';
import { colors, spacing, borderRadius, typography, shadows } from '../constants/theme';

const AddressManagementScreen = () => {
  const navigation = useNavigation();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // 🔹 Fetch addresses
  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const list = await addressService.getMyAddresses();
      setAddresses(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('❌ Fetch addresses error:', err);
      Alert.alert('Lỗi', 'Không thể tải danh sách địa chỉ.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAddresses();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAddresses();
    setRefreshing(false);
  };

  // 🔹 Handle delete
  const handleDelete = async (addressId) => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc muốn xóa địa chỉ này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeletingId(addressId);
              await addressService.deleteAddress(addressId);
              Alert.alert('Thành công', 'Đã xóa địa chỉ.');
              await fetchAddresses();
            } catch (err) {
              Alert.alert('Lỗi', 'Không thể xóa địa chỉ.');
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  // 🔹 Handle set default
  const handleSetDefault = async (addressId) => {
    try {
      await addressService.setDefaultAddress(addressId);
      Alert.alert('Thành công', 'Đã đặt làm địa chỉ mặc định.');
      await fetchAddresses();
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể đặt địa chỉ mặc định.');
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

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
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Địa chỉ của tôi</Text>
          <Pressable
            style={styles.addButton}
            onPress={() => navigation.navigate('AddressForm', { mode: 'create' })}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </Pressable>
        </View>
      </LinearGradient>

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
        {addresses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="location-outline" size={80} color={colors.textLight} />
            </View>
            <Text style={styles.emptyTitle}>Chưa có địa chỉ</Text>
            <Text style={styles.emptyText}>
              Thêm địa chỉ mới để nhận hàng nhanh chóng
            </Text>
            <Pressable
              style={styles.addFirstBtn}
              onPress={() => navigation.navigate('AddressForm', { mode: 'create' })}
            >
              <LinearGradient
                colors={[colors.gradientStart, colors.gradientEnd]}
                style={styles.addFirstBtnGradient}
              >
                <Ionicons name="add-circle" size={20} color="#fff" />
                <Text style={styles.addFirstText}>Thêm địa chỉ đầu tiên</Text>
              </LinearGradient>
            </Pressable>
          </View>
        ) : (
          addresses.map((address) => (
            <View key={address.addressId} style={styles.addressCard}>
              <View style={styles.addressHeader}>
                <View style={styles.addressHeaderLeft}>
                  <Ionicons
                    name={address.label === 'Office' ? 'business' : 'home'}
                    size={24}
                    color={colors.primary}
                  />
                  <View style={styles.addressTitleContainer}>
                    <Text style={styles.addressLabel}>
                      {address.label === 'Office' ? 'Công ty' : 'Nhà riêng'}
                    </Text>
                    {address.isDefault && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultBadgeText}>Mặc định</Text>
                      </View>
                    )}
                  </View>
                </View>
                <View style={styles.addressActions}>
                  {!address.isDefault && (
                    <Pressable
                      style={styles.actionBtn}
                      onPress={() => handleSetDefault(address.addressId)}
                    >
                      <Ionicons name="star-outline" size={20} color={colors.warning} />
                    </Pressable>
                  )}
                  <Pressable
                    style={styles.actionBtn}
                    onPress={() =>
                      navigation.navigate('AddressForm', {
                        mode: 'edit',
                        address,
                      })
                    }
                  >
                    <Ionicons name="pencil" size={20} color={colors.primary} />
                  </Pressable>
                  <Pressable
                    style={styles.actionBtn}
                    onPress={() => handleDelete(address.addressId)}
                    disabled={deletingId === address.addressId}
                  >
                    {deletingId === address.addressId ? (
                      <ActivityIndicator size="small" color={colors.error} />
                    ) : (
                      <Ionicons name="trash-outline" size={20} color={colors.error} />
                    )}
                  </Pressable>
                </View>
              </View>

              <View style={styles.addressBody}>
                <Text style={styles.addressName}>{address.fullName}</Text>
                <Text style={styles.addressPhone}>{address.phone}</Text>
                <Text style={styles.addressLine}>{address.line1}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddressManagementScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  headerGradient: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.h3,
    color: '#fff',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
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
  addFirstBtn: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    ...shadows.lg,
  },
  addFirstBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  addFirstText: {
    ...typography.bodyBold,
    color: '#fff',
  },
  addressCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  addressHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  addressTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  addressLabel: {
    ...typography.bodyBold,
    color: colors.text,
  },
  defaultBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  defaultBadgeText: {
    ...typography.small,
    color: '#fff',
    fontWeight: '700',
  },
  addressActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionBtn: {
    padding: spacing.xs,
  },
  addressBody: {
    gap: spacing.xs,
  },
  addressName: {
    ...typography.bodyBold,
    color: colors.text,
  },
  addressPhone: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  addressLine: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});

