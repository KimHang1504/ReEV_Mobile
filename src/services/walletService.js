import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
};
