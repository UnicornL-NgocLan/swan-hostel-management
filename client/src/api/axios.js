// src/api/axios.js
import axios from 'axios';
import { API_BASE_URL } from '../constants';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — tự động đính token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — xử lý lỗi 401 và trích xuất message từ server
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    // Trích xuất message từ server response và gắn trực tiếp vào error
    // Sau này chỉ cần dùng err.message trong các catch block
    const serverMessage = error.response?.data?.message;
    const serverErrors = error.response?.data?.errors;

    if (serverMessage) {
      error.message = serverErrors?.length
        ? `${serverMessage} — ${serverErrors.map(e => e.message).join(', ')}`
        : serverMessage;
    }
    // Nếu không có response (network error), giữ nguyên message mặc định của axios

    return Promise.reject(error);
  }
);

export default axiosInstance;
