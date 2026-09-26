// src/api/property.api.js
import axiosInstance from './axios';

export const propertyApi = {
  getAll: () => axiosInstance.get('/properties').then(r => r.data),
  getById: (id) => axiosInstance.get(`/properties/${id}`).then(r => r.data),
  create: (data) => axiosInstance.post('/properties', data).then(r => r.data),
  update: (id, data) => axiosInstance.put(`/properties/${id}`, data).then(r => r.data),
  remove: (id) => axiosInstance.delete(`/properties/${id}`).then(r => r.data),

  // Floors
  getFloors: (propertyId) => axiosInstance.get(`/properties/${propertyId}/floors`).then(r => r.data),
  createFloor: (propertyId, data) => axiosInstance.post(`/properties/${propertyId}/floors`, data).then(r => r.data),
  updateFloor: (propertyId, floorId, data) => axiosInstance.put(`/properties/${propertyId}/floors/${floorId}`, data).then(r => r.data),
  deleteFloor: (propertyId, floorId) => axiosInstance.delete(`/properties/${propertyId}/floors/${floorId}`).then(r => r.data),

  // Rooms nested under property
  getRooms: (propertyId, params) => axiosInstance.get(`/properties/${propertyId}/rooms`, { params }).then(r => r.data),
  createRoom: (propertyId, data) => axiosInstance.post(`/properties/${propertyId}/rooms`, data).then(r => r.data),
};
