// src/api/expense.api.js
import axiosInstance from './axios';

export const expenseApi = {
  getAll: (params) => axiosInstance.get('/expenses', { params }).then(r => r.data),
  create: (data) => axiosInstance.post('/expenses', data).then(r => r.data),
  remove: (id) => axiosInstance.delete(`/expenses/${id}`).then(r => r.data),
};
