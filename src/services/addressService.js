// src/services/addressService.js
import { api } from './api';

export const addressService = {
  /**
   * Lấy danh sách địa chỉ của user
   */
  async getMyAddresses() {
    const res = await api.get('/addresses');
    return res.data?.data || res.data || [];
  },

  /**
   * Tạo địa chỉ mới
   */
  async createAddress(payload) {
    const res = await api.post('/addresses', payload);
    return res.data?.data || res.data;
  },

  /**
   * Cập nhật địa chỉ
   */
  async updateAddress(addressId, payload) {
    const res = await api.put(`/addresses/${addressId}`, payload);
    return res.data?.data || res.data;
  },

  /**
   * Xóa địa chỉ
   */
  async deleteAddress(addressId) {
    await api.delete(`/addresses/${addressId}`);
  },

  /**
   * Đặt làm địa chỉ mặc định
   */
  async setDefaultAddress(addressId) {
    await api.patch(`/addresses/${addressId}/set-default`);
  },
};

