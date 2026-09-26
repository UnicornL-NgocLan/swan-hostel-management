// src/api/meter.api.js
import axiosInstance from './axios';

export const meterApi = {
  createReading: (data) => axiosInstance.post('/meters', data).then(r => r.data),
  getReadings: (roomId, billingPeriod) =>
    axiosInstance.get(`/meters/room/${roomId}`, { params: billingPeriod ? { billingPeriod } : {} }).then(r => r.data),
};
