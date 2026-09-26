// src/api/payment.api.js
import axiosInstance from './axios';

export const paymentApi = {
  getAll: (params) => axiosInstance.get('/payments', { params }).then(r => r.data),
};
