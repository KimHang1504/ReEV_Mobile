import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking } from 'react-native';

const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/wallet`;

export const walletService = {
  async payOrder(orderId) {
    const token = await AsyncStorage.getItem('token');
    const res = await axios.post(
      `${API_URL}/pay-order`,
      { orderId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  },

  async getAvailable() {
    const token = await AsyncStorage.getItem('token');
    const res = await axios.get(`${API_URL}/available`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data?.data;
  },

  /**
   * 💰 Nạp tiền vào ví - redirect đến webview PayOS
   * @param {number} amount - Số tiền nạp (VND)
   * @returns {Promise<string>} checkoutUrl để mở trong webview
   */
  async deposit(amount) {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.post(
        `${API_URL}/deposit`,
        { amount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const checkoutUrl = res.data?.data?.checkoutUrl || res.data?.checkoutUrl;
      if (checkoutUrl) {
        // Mở webview để thanh toán
        await Linking.openURL(checkoutUrl);
        return checkoutUrl;
      }
      throw new Error('Không nhận được link thanh toán');
    } catch (err) {
      console.error('💥 Deposit error:', err.response?.data || err.message);
      throw err;
    }
  },

  /**
   * 💸 Rút tiền từ ví
   * @param {Object} data - { amount, accountNumber, bankCode, note }
   * @returns {Promise<Object>} paymentId và status
   */
  async withdraw(data) {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.post(
        `${API_URL}/withdrawals`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return res.data?.data || res.data;
    } catch (err) {
      console.error('💥 Withdraw error:', err.response?.data || err.message);
      throw err;
    }
  },
};
