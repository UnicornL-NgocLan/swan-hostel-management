// src/api/room.api.js
import axiosInstance from './axios';

export const roomApi = {
  getById: (id) => axiosInstance.get(`/rooms/${id}`).then(r => r.data),
  update: (id, data) => axiosInstance.put(`/rooms/${id}`, data).then(r => r.data),
  remove: (id) => axiosInstance.delete(`/rooms/${id}`).then(r => r.data),

  // State machine actions
  reserve: (id) => axiosInstance.post(`/rooms/${id}/reserve`).then(r => r.data),
  cancelReserve: (id) => axiosInstance.post(`/rooms/${id}/cancel-reserve`).then(r => r.data),
  startMaintenance: (id) => axiosInstance.post(`/rooms/${id}/maintenance`).then(r => r.data),
  completeMaintenance: (id) => axiosInstance.post(`/rooms/${id}/maintenance/complete`).then(r => r.data),
};
