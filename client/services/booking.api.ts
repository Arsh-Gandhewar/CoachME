import api from './api';
import type { ApiResponse, Booking, SlotInfo } from '@/types';

export const bookingApi = {
  create: async (data: {
    trainerId: string;
    bookingDate: string;
    timeSlot: string;
    sessionType: string;
    notes?: string;
  }) => {
    const response = await api.post<ApiResponse<Booking>>('/bookings', data);
    return response.data;
  },

  getMyBookings: async (params?: { status?: string; page?: number; limit?: number }) => {
    const response = await api.get<ApiResponse<Booking[]>>('/bookings/my', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<ApiResponse<Booking>>(`/bookings/${id}`);
    return response.data;
  },

  getTrainerBookings: async (params?: { status?: string; page?: number; limit?: number }) => {
    const response = await api.get<ApiResponse<Booking[]>>('/bookings/trainer', { params });
    return response.data;
  },

  updateStatus: async (id: string, status: string) => {
    const response = await api.put<ApiResponse<Booking>>(`/bookings/${id}/status`, { status });
    return response.data;
  },

  cancel: async (id: string, reason?: string) => {
    const response = await api.put<ApiResponse<Booking>>(`/bookings/${id}/cancel`, { reason });
    return response.data;
  },

  getAvailableSlots: async (trainerId: string, date: string) => {
    const response = await api.get<ApiResponse<SlotInfo[]>>(
      `/bookings/slots/${trainerId}?date=${date}`
    );
    return response.data;
  },

  initiatePayment: async (bookingId: string) => {
    const response = await api.post<
      ApiResponse<{
        orderId: string;
        amount: number;
        currency: string;
        key: string;
      }>
    >(`/bookings/${bookingId}/payment`);
    return response.data;
  },

  verifyPayment: async (data: {
    bookingId: string;
    razorpayPaymentId: string;
    razorpayOrderId: string;
    razorpaySignature: string;
  }) => {
    const response = await api.post<ApiResponse<Booking>>('/bookings/verify-payment', data);
    return response.data;
  },
};
