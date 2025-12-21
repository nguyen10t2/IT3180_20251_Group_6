import axios from 'axios';

export const axiosClient = axios.create({
  // Lấy từ .env.local hoặc mặc định là port của Backend nhóm bạn
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tự động gắn Token vào mỗi Request (Nhiệm vụ Người A Ngày 1-2) 
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});