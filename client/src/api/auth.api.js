// src/api/auth.api.js
import axiosInstance from './axios';

export const authApi = {
  /**
   * Đăng nhập
   */
  login: async (username, password) => {
    const res = await axiosInstance.post('/auth/login', { username, password });
    return res.data;
  },

  /**
   * Lấy thông tin user hiện tại
   */
  getMe: async () => {
    const res = await axiosInstance.get('/auth/me');
    return res.data;
  },

  /**
   * Đăng xuất
   */
  logout: async () => {
    const res = await axiosInstance.post('/auth/logout');
    return res.data;
  },

  /**
   * Đổi mật khẩu
   */
  changePassword: async (currentPassword, newPassword) => {
    const res = await axiosInstance.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return res.data;
  },
};
