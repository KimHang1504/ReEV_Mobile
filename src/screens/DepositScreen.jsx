// src/screens/DepositScreen.jsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { walletService } from '../services/walletService';
import { colors, spacing, borderRadius, typography, shadows } from '../constants/theme';

const DepositScreen = () => {
  const navigation = useNavigation();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDeposit = async () => {
    const amountNum = parseFloat(amount);
    
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập số tiền hợp lệ');
      return;
    }

    try {
      setLoading(true);
      // Gọi API deposit - sẽ mở webview PayOS
      await walletService.deposit(amountNum);
      Alert.alert(
        'Thành công',
        'Đang chuyển đến cổng thanh toán. Vui lòng hoàn tất thanh toán trên webview.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Sau khi thanh toán thành công, PayOS sẽ redirect về app với code=00
              // App sẽ tự động navigate đến PaymentSuccessScreen
              navigation.goBack();
            },
          },
        ]
      );
    } catch (err) {
      console.error('Deposit error:', err);
      Alert.alert(
        'Lỗi',
        err.response?.data?.message || 'Không thể tạo yêu cầu nạp tiền. Vui lòng thử lại.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Gradient Header */}
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
          <Text style={styles.headerTitle}>Nạp tiền vào ví</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Icon Card */}
        <View style={styles.iconCard}>
          <LinearGradient
            colors={[colors.success + '20', colors.success + '10']}
            style={styles.iconContainer}
          >
            <Ionicons name="wallet" size={48} color={colors.success} />
          </LinearGradient>
          <Text style={styles.iconCardTitle}>Nạp tiền nhanh chóng</Text>
          <Text style={styles.iconCardSubtitle}>
            Thanh toán an toàn qua PayOS
          </Text>
        </View>

        {/* Amount Input Card */}
        <View style={styles.card}>
          <Text style={styles.label}>Số tiền nạp</Text>
          <View style={styles.inputContainer}>
            <View style={styles.currencyBadge}>
              <Text style={styles.currency}>₫</Text>
            </View>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={colors.textLight}
              value={amount}
              onChangeText={setAmount}
              editable={!loading}
            />
          </View>
          <Text style={styles.hint}>
            Số tiền tối thiểu: <Text style={styles.hintBold}>10,000 ₫</Text>
          </Text>
        </View>

        {/* Quick Amount Buttons */}
        <View style={styles.quickAmountContainer}>
          <Text style={styles.quickAmountLabel}>Chọn nhanh:</Text>
          <View style={styles.quickAmountRow}>
            {[50000, 100000, 200000, 500000].map((quickAmount) => (
              <Pressable
                key={quickAmount}
                style={styles.quickAmountBtn}
                onPress={() => setAmount(quickAmount.toString())}
              >
                <Text style={styles.quickAmountText}>
                  {quickAmount.toLocaleString('vi-VN')}₫
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Submit Button */}
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
        >
          <Pressable
            onPress={handleDeposit}
            disabled={loading}
            style={styles.submitBtnInner}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="wallet" size={22} color="#fff" />
                <Text style={styles.submitText}>Nạp tiền ngay</Text>
              </>
            )}
          </Pressable>
        </LinearGradient>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={24} color={colors.info} />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoTitle}>Lưu ý</Text>
            <Text style={styles.infoText}>
              Sau khi nhấn "Nạp tiền", bạn sẽ được chuyển đến cổng thanh toán PayOS.
              Sau khi thanh toán thành công (code=00), bạn sẽ được chuyển về ứng dụng.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DepositScreen;

const styles = StyleSheet.create({
  container: {
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
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  iconCard: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  iconCardTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  iconCardSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  label: {
    ...typography.bodyBold,
    color: colors.text,
    marginBottom: spacing.md,
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
  hint: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  hintBold: {
    ...typography.captionBold,
    color: colors.primary,
  },
  quickAmountContainer: {
    marginBottom: spacing.lg,
  },
  quickAmountLabel: {
    ...typography.captionBold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  quickAmountRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  quickAmountBtn: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickAmountText: {
    ...typography.captionBold,
    color: colors.primary,
  },
  submitBtn: {
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    ...shadows.lg,
  },
  submitBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitText: {
    ...typography.bodyBold,
    color: '#fff',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: colors.info + '15',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
  },
  infoTextContainer: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  infoTitle: {
    ...typography.captionBold,
    color: colors.info,
    marginBottom: spacing.xs,
  },
  infoText: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});

