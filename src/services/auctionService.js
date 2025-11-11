// src/services/auctionService.js
import { api } from './api';

export const auctionService = {
  /**
   * Lấy danh sách auctions (đang live hoặc sắp diễn ra)
   */
  async getAllAuctions({ page = 1, limit = 20, status = 'live' } = {}) {
    try {
      const res = await api.get('/auction', {
        params: { page, limit, status },
      });
      return res.data?.data || res.data || [];
    } catch (err) {
      console.error('❌ getAllAuctions error:', err);
      throw err;
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
};
