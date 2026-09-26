// src/api/invoice.api.js
import axiosInstance from './axios';

export const invoiceApi = {
  getAll: (params) => axiosInstance.get('/invoices', { params }).then(r => r.data),
  getById: (id) => axiosInstance.get(`/invoices/${id}`).then(r => r.data),
  create: (data) => axiosInstance.post('/invoices', data).then(r => r.data),
  update: (id, data) => axiosInstance.put(`/invoices/${id}`, data).then(r => r.data),
  preview: (data) => axiosInstance.post('/invoices/preview', data).then(r => r.data),
  bulkCreate: (data) => axiosInstance.post('/invoices/bulk', data).then(r => r.data),
  pay: (id, data) => axiosInstance.post(`/invoices/${id}/pay`, data).then(r => r.data),
  void: (id) => axiosInstance.post(`/invoices/${id}/void`).then(r => r.data),
  downloadPdf: (id) => axiosInstance.get(`/invoices/${id}/pdf`, { responseType: 'blob' }).then(r => r.data),
};
