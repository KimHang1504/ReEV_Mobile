import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/product-listing`;

export const productService = {
  // 🟢 Lấy toàn bộ sản phẩm
  async getAllListings(params = {}) {
    const token = await AsyncStorage.getItem('token');
    const res = await axios.get(API_URL, {
      params,
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data?.data?.data || []; // chú ý: data.data.data theo Swagger
  },

  // 🟡 Lấy sản phẩm của người bán (giữ lại để dùng chỗ khác)
  async getMyListings(params = {}) {
    const token = await AsyncStorage.getItem('token');
    const res = await axios.get(`${API_URL}/mine`, {
      params,
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data?.data?.data || [];
  },

  async getDetail(id) {
    const token = await AsyncStorage.getItem('token');
    const res = await axios.get(`${API_URL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data?.data;
  },
};
