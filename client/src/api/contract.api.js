// src/api/contract.api.js
import axiosInstance from './axios';

export const contractApi = {
  getAll: (params) => axiosInstance.get('/contracts', { params }).then(r => r.data),
  getById: (id) => axiosInstance.get(`/contracts/${id}`).then(r => r.data),
  create: (data) => axiosInstance.post('/contracts', data).then(r => r.data),
  update: (id, data) => axiosInstance.put(`/contracts/${id}`, data).then(r => r.data),
  renew: (id, data) => axiosInstance.post(`/contracts/${id}/renew`, data).then(r => r.data),
  transfer: (id, data) => axiosInstance.post(`/contracts/${id}/transfer`, data).then(r => r.data),
  terminate: (id, data) => axiosInstance.post(`/contracts/${id}/terminate`, data).then(r => r.data),
  void: (id, data) => axiosInstance.post(`/contracts/${id}/void`, data).then(r => r.data),
  getDeposit: (id) => axiosInstance.get(`/contracts/${id}/deposit`).then(r => r.data),
  checkoutPreview: (id, data) => axiosInstance.post(`/contracts/${id}/checkout-preview`, data).then(r => r.data),
  checkout: (id, data) => axiosInstance.post(`/contracts/${id}/checkout`, data).then(r => r.data),
};
