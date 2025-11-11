import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/orders`;

export const orderService = {
  /**
   * 🧾 Tạo đơn hàng chính xác theo ReEV backend
   * - buyerId: ID người mua (userId)
   * - payload: body gửi BE giống web
   */
  async createOrder(buyerId, payload) {
    const token = await AsyncStorage.getItem('token');
    if (!buyerId || !payload) throw new Error('Missing buyerId or payload');

    console.log('📦 Body gửi lên:', JSON.stringify(payload, null, 2));

    const res = await axios.post(`${API_URL}/${buyerId}`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log('🟢 Order created:', res.data);
   return res.data?.data?.data;
  },
};
