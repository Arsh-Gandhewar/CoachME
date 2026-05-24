import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('trainersapp_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
};

export const trainerAPI = {
  getAll: () => api.get('/trainers'),
  getById: (id) => api.get(`/trainers/${id}`),
};

export const bookingAPI = {
  create: (bookingData) => api.post('/bookings', bookingData),
  getMyBookings: () => api.get('/bookings/my'),
};

export const chatAPI = {
  getMyChats: () => api.get('/chats'),
  getChatByTrainer: (trainerId) => api.get(`/chats/${trainerId}`),
  sendMessage: (trainerId, text) => api.post(`/chats/${trainerId}/message`, { text }),
};

export const paymentAPI = {
  createIntent: (amount) => api.post('/payments/create-intent', { amount }),
};

export default api;
