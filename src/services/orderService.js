import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/orders`;

export const orderService = {
  async createOrder(buyerId, payload) {
    const token = await AsyncStorage.getItem('token');
    const res = await axios.post(`${API_URL}/${buyerId}`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data?.data;
  },
};
