// src/constants/index.js

export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
};

export const ROOM_STATUS = {
  AVAILABLE: 'AVAILABLE',
  RESERVED: 'RESERVED',
  OCCUPIED: 'OCCUPIED',
  MAINTENANCE: 'MAINTENANCE',
};

export const ROOM_STATUS_LABEL = {
  AVAILABLE: 'Trống',
  RESERVED: 'Giữ chỗ',
  OCCUPIED: 'Đang thuê',
  MAINTENANCE: 'Đang sửa',
};

export const ROOM_STATUS_COLOR = {
  AVAILABLE: 'success',
  RESERVED: 'warning',
  OCCUPIED: 'processing',
  MAINTENANCE: 'error',
};

export const CONTRACT_STATUS = {
  DRAFT: 'DRAFT',
  RESERVED: 'RESERVED',
  ACTIVE: 'ACTIVE',
  RENEWED: 'RENEWED',
  TRANSFERRED: 'TRANSFERRED',
  TERMINATED: 'TERMINATED',
  COMPLETED: 'COMPLETED',
};

export const INVOICE_STATUS = {
  DRAFT: 'DRAFT',
  ISSUED: 'ISSUED',
  PARTIAL: 'PARTIAL',
  PAID: 'PAID',
  OVERDUE: 'OVERDUE',
  VOID: 'VOID',
};

export const INVOICE_STATUS_LABEL = {
  DRAFT: 'Nháp',
  ISSUED: 'Đã phát hành',
  PARTIAL: 'Thanh toán 1 phần',
  PAID: 'Đã thanh toán',
  OVERDUE: 'Quá hạn',
  VOID: 'Đã hủy',
};

export const INVOICE_STATUS_COLOR = {
  DRAFT: 'default',
  ISSUED: 'blue',
  PARTIAL: 'orange',
  PAID: 'green',
  OVERDUE: 'red',
  VOID: 'gray',
};
