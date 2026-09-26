// src/api/dashboard.api.js
import axiosInstance from './axios';

export const dashboardApi = {
  getOverview: () => axiosInstance.get('/dashboard').then(r => r.data),
};
