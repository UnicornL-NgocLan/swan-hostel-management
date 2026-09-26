// src/stores/auth.store.js
import { create } from 'zustand';
import { authApi } from '../api/auth.api';

const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token') || null,
  isLoading: false,
  isAuthenticated: !!localStorage.getItem('token'),

  /**
   * Login
   */
  login: async (username, password) => {
    set({ isLoading: true });
    try {
      const response = await authApi.login(username, password);
      const { user, token } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });

      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      const message = error.response?.data?.message || 'Đăng nhập thất bại';
      return { success: false, message };
    }
  },

  /**
   * Logout
   */
  logout: async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore logout API errors
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({
        user: null,
        token: null,
        isAuthenticated: false,
      });
    }
  },

  /**
   * Refresh user info
   */
  refreshUser: async () => {
    try {
      const response = await authApi.getMe();
      const user = response.data;
      localStorage.setItem('user', JSON.stringify(user));
      set({ user });
    } catch {
      // Token invalid — logout
      get().logout();
    }
  },
}));

export default useAuthStore;
