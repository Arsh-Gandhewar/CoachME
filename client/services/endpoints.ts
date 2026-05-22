import api from './api';
import { ApiResponse, LoginPayload, RegisterPayload, Trainer, Category, Booking, Review, Chat, Notification } from '../types';

// Auth APIs
export const authAPI = {
  login: (data: LoginPayload) => api.post<ApiResponse<any>>('/auth/login', data),
  register: (data: RegisterPayload) => api.post<ApiResponse<any>>('/auth/register', data),
  sendOtp: (email: string) => api.post('/auth/send-otp', { email }),
  verifyOtp: (email: string, otp: string) => api.post('/auth/verify-otp', { email, otp }),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) => api.post('/auth/reset-password', { token, password }),
  getMe: () => api.get('/auth/me'),
};

// Trainer APIs
export const trainerAPI = {
  getAll: (params?: Record<string, any>) => api.get<ApiResponse<Trainer[]>>('/trainers', { params }),
  getById: (id: string) => api.get<ApiResponse<Trainer>>(`/trainers/${id}`),
  getFeatured: () => api.get<ApiResponse<Trainer[]>>('/trainers/featured'),
  getTopRated: () => api.get<ApiResponse<Trainer[]>>('/trainers/top-rated'),
  getCategories: () => api.get<ApiResponse<Category[]>>('/trainers/categories'),
  getReviews: (id: string) => api.get<ApiResponse<Review[]>>(`/trainers/${id}/reviews`),
  getAvailability: (id: string) => api.get(`/trainers/${id}/availability`),
  getPlatformStats: () => api.get<ApiResponse<{trainersCount: number, bookingsCount: number, categoriesCount: number}>>('/trainers/stats/platform'),
};

// Booking APIs
export const bookingAPI = {
  create: (data: any) => api.post<ApiResponse<Booking>>('/bookings', data),
  getUserBookings: () => api.get<ApiResponse<Booking[]>>('/bookings'),
  getTrainerBookings: () => api.get<ApiResponse<Booking[]>>('/bookings/trainer'),
  updateStatus: (id: string, status: string) => api.patch(`/bookings/${id}/status`, { status }),
  reschedule: (id: string, data: any) => api.patch(`/bookings/${id}/reschedule`, data),
};

// User APIs
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: any) => api.put('/users/profile', data),
  toggleFavorite: (trainerId: string) => api.post(`/users/favorites/${trainerId}`),
  getFavorites: () => api.get('/users/favorites'),
  createReview: (data: any) => api.post('/users/reviews', data),
};

// Chat APIs
export const chatAPI = {
  getChats: () => api.get<ApiResponse<Chat[]>>('/chats'),
  getMessages: (chatId: string) => api.get(`/chats/${chatId}/messages`),
  sendMessage: (receiverId: string, text: string) => api.post(`/chats/${receiverId}/message`, { text }),
};

// Notification APIs
export const notificationAPI = {
  getAll: () => api.get<ApiResponse<Notification[]>>('/notifications'),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
};

// Payment APIs
export const paymentAPI = {
  createOrder: (data: { bookingId: string, amount: number }) => api.post('/payments/create-order', data),
  verify: (data: any) => api.post('/payments/verify', data),
  getHistory: () => api.get('/payments/history'),
  setupCard: () => api.post('/payments/setup-card'),
  getMethods: () => api.get('/payments/methods'),
  deleteMethod: (tokenId: string) => api.delete(`/payments/methods/${tokenId}`)
};

// Subscription APIs
export const subscriptionAPI = {
  createTrainerSubscription: () => api.post('/subscriptions/create'),
  verifyTrainerSubscription: (data: any) => api.post('/subscriptions/verify', data)
};

// Content APIs
export const contentAPI = {
  getDailyQuote: () => api.get('/quotes/daily'),
  uploadImage: (formData: FormData) => api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

// Support APIs
export const supportAPI = {
  chat: (data: { message: string, history?: { role: string, text: string }[] }) => api.post('/support/chat', data),
};
