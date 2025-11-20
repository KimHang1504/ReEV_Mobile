// src/screens/AddressFormScreen.jsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { addressService } from '../services/addressService';
import { colors, spacing, borderRadius, typography, shadows } from '../constants/theme';

const AddressFormScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { mode, address } = route.params || {};

  const [fullName, setFullName] = useState(address?.fullName || '');
  const [phone, setPhone] = useState(address?.phone || '');
  const [line1, setLine1] = useState(address?.line1 || '');
  const [note, setNote] = useState(address?.note || '');
  const [selectedLabel, setSelectedLabel] = useState(address?.label || 'Home');
  const [isDefault, setIsDefault] = useState(address?.isDefault || false);

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(address?.provinceId || null);
  const [selectedDistrict, setSelectedDistrict] = useState(address?.districtId || null);
  const [selectedWard, setSelectedWard] = useState(address?.wardCode || null);

  const [loading, setLoading] = useState(false);
  const [loadingProvinces, setLoadingProvinces] = useState(true);

  // 🔹 Fetch provinces
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        setLoadingProvinces(true);
        const response = await fetch('https://provinces.open-api.vn/api/p/');
        const data = await response.json();
        setProvinces(data);
      } catch (err) {
        console.error('Fetch provinces error:', err);
        Alert.alert('Lỗi', 'Không thể tải danh sách tỉnh/thành phố.');
      } finally {
        setLoadingProvinces(false);
      }
    };
    fetchProvinces();
  }, []);

  // 🔹 Fetch districts when province selected
  useEffect(() => {
    if (!selectedProvince) {
      setDistricts([]);
      setWards([]);
      return;
    }

    const fetchDistricts = async () => {
      try {
        const response = await fetch(
          `https://provinces.open-api.vn/api/p/${selectedProvince}?depth=2`
        );
        const data = await response.json();
        setDistricts(data.districts || []);
        setWards([]);
        setSelectedDistrict(null);
        setSelectedWard(null);
      } catch (err) {
        console.error('Fetch districts error:', err);
      }
    };

    fetchDistricts();
  }, [selectedProvince]);

  // 🔹 Fetch wards when district selected
  useEffect(() => {
    if (!selectedDistrict) {
      setWards([]);
      return;
    }

    const fetchWards = async () => {
      try {
        const response = await fetch(
          `https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`
        );
        const data = await response.json();
        setWards(data.wards || []);
        setSelectedWard(null);
      } catch (err) {
        console.error('Fetch wards error:', err);
      }
    };

    fetchWards();
  }, [selectedDistrict]);

  // 🔹 Load existing address data
  useEffect(() => {
    if (address && mode === 'edit') {
      // Load districts and wards for existing address
      if (address.provinceId) {
        setSelectedProvince(address.provinceId);
        // Districts and wards will be loaded by useEffect
      }
    }
  }, [address, mode]);

  // 🔹 Handle submit
  const handleSubmit = async () => {
    if (!fullName || !phone || !line1 || !selectedProvince || !selectedDistrict || !selectedWard) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin.');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        fullName,
        phone,
        line1,
        provinceId: Number(selectedProvince),
        districtId: Number(selectedDistrict),
        wardCode: String(selectedWard),
        label: selectedLabel,
        note: note || '',
        isDefault,
      };

      if (mode === 'edit' && address?.addressId) {
        await addressService.updateAddress(address.addressId, payload);
        Alert.alert('Thành công', 'Đã cập nhật địa chỉ.');
      } else {
        await addressService.createAddress(payload);
        Alert.alert('Thành công', 'Đã thêm địa chỉ mới.');
      }

      navigation.goBack();
    } catch (err) {
      console.error('Submit address error:', err);
      Alert.alert('Lỗi', err.response?.data?.message || 'Không thể lưu địa chỉ.');
    } finally {
      setLoading(false);
    }
  };

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
          <Text style={styles.headerTitle}>
            {mode === 'edit' ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ mới'}
          </Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Form Fields */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Họ và tên *</Text>
          <TextInput
            style={styles.input}
            placeholder="Nguyễn Văn A"
            value={fullName}
            onChangeText={setFullName}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Số điện thoại *</Text>
          <TextInput
            style={styles.input}
            placeholder="0901234567"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Tỉnh/Thành phố *</Text>
          {loadingProvinces ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.selectRow}>
                {provinces.map((province) => (
                  <Pressable
                    key={province.code}
                    style={[
                      styles.selectOption,
                      selectedProvince === province.code && styles.selectOptionSelected,
                    ]}
                    onPress={() => setSelectedProvince(province.code)}
                  >
                    <Text
                      style={[
                        styles.selectOptionText,
                        selectedProvince === province.code && styles.selectOptionTextSelected,
                      ]}
                    >
                      {province.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          )}
        </View>

        {selectedProvince && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Quận/Huyện *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.selectRow}>
                {districts.map((district) => (
                  <Pressable
                    key={district.code}
                    style={[
                      styles.selectOption,
                      selectedDistrict === district.code && styles.selectOptionSelected,
                    ]}
                    onPress={() => setSelectedDistrict(district.code)}
                  >
                    <Text
                      style={[
                        styles.selectOptionText,
                        selectedDistrict === district.code && styles.selectOptionTextSelected,
                      ]}
                    >
                      {district.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {selectedDistrict && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Phường/Xã *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.selectRow}>
                {wards.map((ward) => (
                  <Pressable
                    key={ward.code}
                    style={[
                      styles.selectOption,
                      selectedWard === ward.code && styles.selectOptionSelected,
                    ]}
                    onPress={() => setSelectedWard(ward.code)}
                  >
                    <Text
                      style={[
                        styles.selectOptionText,
                        selectedWard === ward.code && styles.selectOptionTextSelected,
                      ]}
                    >
                      {ward.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        <View style={styles.formGroup}>
          <Text style={styles.label}>Địa chỉ chi tiết *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Ví dụ: 123 Đường Láng, Phường Láng Thượng"
            multiline
            numberOfLines={3}
            value={line1}
            onChangeText={setLine1}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Loại địa chỉ</Text>
          <View style={styles.labelRow}>
            <Pressable
              style={[
                styles.labelOption,
                selectedLabel === 'Home' && styles.labelOptionSelected,
              ]}
              onPress={() => setSelectedLabel('Home')}
            >
              <Ionicons
                name="home"
                size={20}
                color={selectedLabel === 'Home' ? '#fff' : colors.primary}
              />
              <Text
                style={[
                  styles.labelOptionText,
                  selectedLabel === 'Home' && styles.labelOptionTextSelected,
                ]}
              >
                Nhà riêng
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.labelOption,
                selectedLabel === 'Office' && styles.labelOptionSelected,
              ]}
              onPress={() => setSelectedLabel('Office')}
            >
              <Ionicons
                name="business"
                size={20}
                color={selectedLabel === 'Office' ? '#fff' : colors.primary}
              />
              <Text
                style={[
                  styles.labelOptionText,
                  selectedLabel === 'Office' && styles.labelOptionTextSelected,
                ]}
              >
                Công ty
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Ghi chú (tùy chọn)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Thêm ghi chú..."
            multiline
            numberOfLines={2}
            value={note}
            onChangeText={setNote}
          />
        </View>

        <Pressable
          style={styles.checkboxContainer}
          onPress={() => setIsDefault(!isDefault)}
        >
          <Ionicons
            name={isDefault ? 'checkbox' : 'checkbox-outline'}
            size={24}
            color={isDefault ? colors.primary : colors.border}
          />
          <Text style={styles.checkboxLabel}>Đặt làm địa chỉ mặc định</Text>
        </Pressable>

        {/* Submit Button */}
        <Pressable
          style={styles.submitBtn}
          onPress={handleSubmit}
          disabled={loading}
        >
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientEnd]}
            style={styles.submitBtnGradient}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.submitBtnText}>
                  {mode === 'edit' ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ'}
                </Text>
              </>
            )}
          </LinearGradient>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddressFormScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
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
  container: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  formGroup: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.bodyBold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.body,
    color: colors.text,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  selectRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  selectOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  selectOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  selectOptionText: {
    ...typography.captionBold,
    color: colors.text,
  },
  selectOptionTextSelected: {
    color: '#fff',
  },
  labelRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  labelOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
    gap: spacing.xs,
  },
  labelOptionSelected: {
    backgroundColor: colors.primary,
  },
  labelOptionText: {
    ...typography.captionBold,
    color: colors.primary,
  },
  labelOptionTextSelected: {
    color: '#fff',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  checkboxLabel: {
    ...typography.body,
    color: colors.text,
  },
  submitBtn: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    ...shadows.lg,
  },
  submitBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  submitBtnText: {
    ...typography.bodyBold,
    color: '#fff',
  },
});

