import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/orders`;

export const orderService = {
  /** 🧾 Tạo đơn hàng */
  async createOrder(buyerId, payload) {
    if (!buyerId || !payload) throw new Error("Missing buyerId or payload");
    const token = await AsyncStorage.getItem("token");

    const res = await axios.post(`${API_URL}/${buyerId}`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const order = res.data?.data?.data || res.data?.data;
    console.log("🟢 Order created:", order?.orderId || order);
    return order;
  },

  /** 📋 Lấy danh sách đơn của buyer */
  async getOrdersByBuyer(buyerId, { status, page = 1, limit = 20 } = {}) {
    if (!buyerId) throw new Error("Missing buyerId");
    const token = await AsyncStorage.getItem("token");

    const params = {
      buyerId,
      page,
      limit,
      sortBy: "createdAt",
      sortOrder: "DESC",
      ...(status && status !== "all" ? { status } : {}),
    };

    const res = await axios.get(API_URL, {
      params,
      headers: { Authorization: `Bearer ${token}` },
    });

    const inner = res.data?.data ?? {};
    const list =
      inner.data ??
      inner.items ??
      (Array.isArray(inner) ? inner : []) ??
      [];

    const normalized = {
      items: Array.isArray(list) ? list : [],
      total: inner.total ?? list.length ?? 0,
      page: inner.page ?? page,
      limit: inner.limit ?? limit,
    };

    console.log(
      "📦 Orders fetched (normalized):",
      `items=${normalized.items.length}, total=${normalized.total}, page=${normalized.page}`
    );

    return normalized;
  },

  /** 🔍 Lấy chi tiết 1 đơn hàng */
  async getOrderById(orderId) {
    if (!orderId) throw new Error("Missing orderId");
    const token = await AsyncStorage.getItem("token");

    const res = await axios.get(`${API_URL}/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = res.data?.data?.data;
    console.log("📦 Order fetched by ID:", data);
    return data;
  },
};
