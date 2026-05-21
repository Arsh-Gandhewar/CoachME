import api from './api';
import type { ApiResponse, Trainer, Review } from '@/types';

export const trainerApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    rating?: number;
    sessionType?: string;
    sort?: string;
    search?: string;
  }) => {
    const response = await api.get<ApiResponse<Trainer[]>>('/trainers', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<ApiResponse<Trainer>>(`/trainers/${id}`);
    return response.data;
  },

  getFeatured: async () => {
    const response = await api.get<ApiResponse<Trainer[]>>('/trainers/featured');
    return response.data;
  },

  getTopRated: async () => {
    const response = await api.get<ApiResponse<Trainer[]>>('/trainers/top-rated');
    return response.data;
  },

  getByCategory: async (category: string) => {
    const response = await api.get<ApiResponse<Trainer[]>>(`/trainers/category/${category}`);
    return response.data;
  },

  getReviews: async (trainerId: string) => {
    const response = await api.get<ApiResponse<Review[]>>(`/trainers/${trainerId}/reviews`);
    return response.data;
  },

  addReview: async (trainerId: string, data: { rating: number; comment: string }) => {
    const response = await api.post<ApiResponse<Review>>(`/trainers/${trainerId}/reviews`, data);
    return response.data;
  },

  toggleFavorite: async (trainerId: string) => {
    const response = await api.post<ApiResponse<{ isFavorite: boolean }>>(
      `/trainers/${trainerId}/favorite`
    );
    return response.data;
  },

  getFavorites: async () => {
    const response = await api.get<ApiResponse<Trainer[]>>('/trainers/favorites');
    return response.data;
  },

  updateAvailability: async (availability: Record<string, string[]>) => {
    const response = await api.put<ApiResponse<Trainer>>('/trainers/availability', {
      availability,
    });
    return response.data;
  },

  updateProfile: async (data: Partial<Trainer>) => {
    const response = await api.put<ApiResponse<Trainer>>('/trainers/profile', data);
    return response.data;
  },

  getDashboard: async () => {
    const response = await api.get<
      ApiResponse<{
        totalEarnings: number;
        monthlyEarnings: number;
        totalBookings: number;
        upcomingBookings: number;
        rating: number;
        totalReviews: number;
      }>
    >('/trainers/dashboard');
    return response.data;
  },

  getEarnings: async (params?: { period?: string }) => {
    const response = await api.get<
      ApiResponse<{
        total: number;
        monthly: number;
        weekly: number;
        transactions: Array<{
          _id: string;
          amount: number;
          type: string;
          description: string;
          createdAt: string;
        }>;
      }>
    >('/trainers/earnings', { params });
    return response.data;
  },
};
