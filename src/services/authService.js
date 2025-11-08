import axios from "axios";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

const normalizeError = (error) => {
  if (error?.response) {
    return {
      status: error.response.status,
      data: error.response.data,
      message:
        error.response.data?.message ||
        error.response.data?.error ||
        error.message,
    };
  }
  return { status: null, data: null, message: error.message };
};

export const authService = {
  // 🔹 Login (giữ nguyên)
  login: async (email, password, deviceInfo = "ReactNative") => {
    try {
      const payload = JSON.stringify({ email, password, deviceInfo });
      const response = await api.post("/auth/login", payload, {
        headers: { "Content-Type": "application/json" },
      });
      console.log("✅ authService.login response:", response.data);
      return { status: response.status, data: response.data };
    } catch (error) {
      const err = normalizeError(error);
      console.error("❌ authService.login error:", err);
      throw err;
    }
  },

  // 🔹 Lấy thông tin user hiện tại
  getProfile: async (token) => {
    try {
      const response = await api.get("/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("✅ authService.getProfile:", response.data);
      return { status: response.status, data: response.data };
    } catch (error) {
      const err = normalizeError(error);
      console.error("authService.getProfile error:", err);
      throw err;
    }
  },

  // 🔹 Verify OTP
  verifyOtp: async (email, otp) => {
    try {
      const response = await api.post(
        "/auth/verify-otp",
        JSON.stringify({ email, otp }),
        { headers: { "Content-Type": "application/json" } }
      );
      return { status: response.status, data: response.data };
    } catch (error) {
      const err = normalizeError(error);
      console.error("authService.verifyOtp error:", err);
      throw err;
    }
  },

  // 🔹 Resend OTP
  resendOtp: async (email) => {
    try {
      const response = await api.post(
        "/auth/resend-otp",
        JSON.stringify({ email }),
        { headers: { "Content-Type": "application/json" } }
      );
      return { status: response.status, data: response.data };
    } catch (error) {
      const err = normalizeError(error);
      console.error("authService.resendOtp error:", err);
      throw err;
    }
  },
};
