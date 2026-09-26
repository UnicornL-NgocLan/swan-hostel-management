// src/api/tenant.api.js
import axiosInstance from './axios';

export const tenantApi = {
  getAll: (params) => axiosInstance.get('/tenants', { params }).then(r => r.data),
  getById: (id) => axiosInstance.get(`/tenants/${id}`).then(r => r.data),
  create: (data) => axiosInstance.post('/tenants', data).then(r => r.data),
  update: (id, data) => axiosInstance.put(`/tenants/${id}`, data).then(r => r.data),
  remove: (id) => axiosInstance.delete(`/tenants/${id}`).then(r => r.data),
};
