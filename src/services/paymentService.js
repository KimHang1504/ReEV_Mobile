import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

/**
 * 💳 paymentService
 * Gồm 2 loại thanh toán:
 *  - PayOS: redirect user đến cổng thanh toán bên thứ 3
 *  - Wallet: trừ tiền ví trong hệ thống
 */
export const paymentService = {
  /**
   * 🔹 Thanh toán qua PayOS (VNPay / QR)
   * @param {string} orderId
   */
  async payWithPayOS(orderId) {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.post(
        `${BASE_URL}/payment/order`,
        { orderId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return res.data?.data; // thường trả về { checkoutUrl }
    } catch (err) {
      console.error('💥 PayOS payment error:', err.response?.data || err.message);
      throw err;
    }
  },

  /**
   * 💰 Thanh toán qua ví nội bộ
   * @param {string} orderId
   */
async payWithWallet(orderId, amount) {
  const token = await AsyncStorage.getItem('token');
  const res = await axios.post(
    `${BASE_URL}/wallet/pay-order`,
    { orderId, amount },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data?.data;
}

};
