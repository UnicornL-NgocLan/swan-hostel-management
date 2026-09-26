// src/api/notification.api.js
import axiosInstance from './axios';

export const notificationApi = {
  getAll: () => axiosInstance.get('/notifications').then(r => r.data),
  getUnreadCount: () => axiosInstance.get('/notifications/unread-count').then(r => r.data),
  markAsRead: (id) => axiosInstance.put(`/notifications/${id}/read`).then(r => r.data),
};
