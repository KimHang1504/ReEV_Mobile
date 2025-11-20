// src/screens/WithdrawScreen.jsx
import React, { useState, useEffect } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { walletService } from '../services/walletService';

const WithdrawScreen = () => {
  const navigation = useNavigation();
  const [amount, setAmount] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [banks, setBanks] = useState([]);
  const [loadingBanks, setLoadingBanks] = useState(true);
  const [wallet, setWallet] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch wallet balance
        const walletData = await walletService.getAvailable();
        setWallet(walletData);

        // Fetch banks list
        const response = await fetch('https://api.vietqr.io/v2/banks');
        const data = await response.json();
        if (data.code === '00' && data.data) {
          setBanks(data.data);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoadingBanks(false);
      }
    };
    fetchData();
  }, []);

  const handleWithdraw = async () => {
    const amountNum = parseFloat(amount);
    
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập số tiền hợp lệ');
      return;
    }

    if (wallet && amountNum > (wallet.available || wallet.balance || 0)) {
      Alert.alert('Lỗi', 'Số tiền rút vượt quá số dư khả dụng');
      return;
    }

    if (!accountNumber || !bankCode) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin tài khoản ngân hàng');
      return;
    }

    try {
      setLoading(true);
      const result = await walletService.withdraw({
        amount: amountNum,
        accountNumber,
        bankCode,
        note: note || 'Rút tiền từ ví',
      });

      Alert.alert(
        'Thành công',
        'Yêu cầu rút tiền đã được gửi. Vui lòng chờ admin duyệt.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (err) {
      console.error('Withdraw error:', err);
      Alert.alert(
        'Lỗi',
        err.response?.data?.message || 'Không thể tạo yêu cầu rút tiền. Vui lòng thử lại.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </Pressable>
        <Text style={styles.headerTitle}>Rút tiền từ ví</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {wallet && (
          <View style={styles.balanceBox}>
            <Text style={styles.balanceLabel}>Số dư khả dụng:</Text>
            <Text style={styles.balanceValue}>
              {parseFloat(wallet.available || wallet.balance || 0).toLocaleString()} ₫
            </Text>
          </View>
        )}

        <Text style={styles.label}>Số tiền rút (VND)</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.currency}>₫</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="Nhập số tiền"
            value={amount}
            onChangeText={setAmount}
            editable={!loading}
          />
        </View>

        <Text style={styles.label}>Số tài khoản</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Nhập số tài khoản ngân hàng"
          value={accountNumber}
          onChangeText={setAccountNumber}
          editable={!loading}
        />

        <Text style={styles.label}>Mã ngân hàng</Text>
        {loadingBanks ? (
          <ActivityIndicator size="small" color="#007AFF" />
        ) : (
          <View style={styles.bankList}>
            {banks.slice(0, 10).map((bank) => (
              <Pressable
                key={bank.id}
                style={[
                  styles.bankItem,
                  bankCode === bank.code && styles.bankItemSelected,
                ]}
                onPress={() => setBankCode(bank.code)}
              >
                <Text style={styles.bankText}>
                  {bank.shortName} ({bank.code})
                </Text>
                {bankCode === bank.code && (
                  <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                )}
              </Pressable>
            ))}
          </View>
        )}

        <Text style={styles.label}>Ghi chú (tùy chọn)</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          placeholder="Ghi chú cho yêu cầu rút tiền"
          value={note}
          onChangeText={setNote}
          multiline
          numberOfLines={3}
          editable={!loading}
        />

        <Pressable
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={handleWithdraw}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="cash-outline" size={20} color="#fff" />
              <Text style={styles.submitText}>Gửi yêu cầu rút tiền</Text>
            </>
          )}
        </Pressable>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color="#FF6B6B" />
          <Text style={styles.infoText}>
            Yêu cầu rút tiền sẽ được admin xem xét và duyệt. Thời gian xử lý: 1-3 ngày làm việc.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default WithdrawScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  content: {
    padding: 16,
  },
  balanceBox: {
    backgroundColor: '#E8F5E9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 16,
    color: '#333',
  },
  balanceValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4CAF50',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FF6B6B',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  currency: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FF6B6B',
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  textInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  bankList: {
    marginBottom: 8,
  },
  bankItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  bankItemSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  bankText: {
    fontSize: 14,
    color: '#333',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B6B',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 24,
    marginBottom: 16,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#C62828',
    marginLeft: 8,
    lineHeight: 18,
  },
});

