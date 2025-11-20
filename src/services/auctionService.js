// src/services/auctionService.js
import { api } from './api';

export const auctionService = {
  /**
   * Lấy danh sách auctions (đang live hoặc sắp diễn ra)
   */
  async getAllAuctions({ page = 1, limit = 20, status = 'live' } = {}) {
    try {
      // Backend endpoint là /auction/joinable với params: page, pageSize, status
      const res = await api.get('/auction/joinable', {
        params: { 
          page, 
          pageSize: limit,  // Backend dùng pageSize thay vì limit
          status 
        },
      });
      // Backend trả về format: { items: [...], meta: {...} }
      const data = res.data?.items || res.data?.data || res.data;
      // Đảm bảo luôn trả về array
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error('❌ getAllAuctions error:', err);
      // Trả về empty array thay vì throw để tránh crash
      return [];
    }
  },

  /**
   * Lấy chi tiết auction theo ID
   */
  async getAuctionById(auctionId) {
    try {
      const res = await api.get(`/auction/${auctionId}`);
      return res.data?.data || res.data;
    } catch (err) {
      console.error('❌ getAuctionById error:', err);
      throw err;
    }
  },

  /**
   * Đặt giá đấu (place bid)
   */
  async placeBid(auctionId, amount) {
    try {
      const res = await api.post(`/auction/${auctionId}/bid`, { amount });
      return res.data?.data || res.data;
    } catch (err) {
      console.error('❌ placeBid error:', err);
      throw err;
    }
  },

  /**
   * Lấy danh sách auctions mà user đã tham gia
   */
  async getMyParticipatingAuctions(userId, page = 1, limit = 20) {
    try {
      const res = await api.get(`/auction/user/${userId}/participating`, {
        params: { page, limit },
      });
      return res.data?.data || res.data || [];
    } catch (err) {
      console.error('❌ getMyParticipatingAuctions error:', err);
      throw err;
    }
  },

  /**
   * Lấy danh sách auctions mà user đã thắng
   */
  async getMyWonAuctions(userId, page = 1, limit = 20) {
    try {
      const res = await api.get(`/auction/user/${userId}/won`, {
        params: { page, limit },
      });
      return res.data?.data || res.data || [];
    } catch (err) {
      console.error('❌ getMyWonAuctions error:', err);
      throw err;
    }
  },

  /**
   * Lấy thông tin order cho một phiên đấu giá đã kết thúc
   * Dùng để điều hướng tới trang thanh toán sau khi đấu giá kết thúc
   */
  async getOrderByAuctionId(auctionId) {
    try {
      const res = await api.get(`/auction/${auctionId}/order`);
      // Unwrap NestJS response format if needed
      let data = res.data;
      if (data && typeof data === 'object' && data.data && data.success) {
        data = data.data;
      }
      return data;
    } catch (err) {
      console.error('❌ getOrderByAuctionId error:', err);
      throw err;
    }
  },
};
