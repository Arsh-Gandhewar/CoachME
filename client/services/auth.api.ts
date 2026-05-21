import api from './api';
import type {
  ApiResponse,
  LoginPayload,
  RegisterPayload,
  OtpVerifyPayload,
  AuthTokens,
  User,
  Trainer,
} from '@/types';

export const authApi = {
  login: async (payload: LoginPayload) => {
    const response = await api.post<ApiResponse<{ user: User | Trainer; tokens: AuthTokens }>>(
      '/auth/login',
      payload
    );
    return response.data;
  },

  register: async (payload: RegisterPayload) => {
    const response = await api.post<ApiResponse<{ message: string }>>('/auth/register', payload);
    return response.data;
  },

  verifyOtp: async (payload: OtpVerifyPayload) => {
    const response = await api.post<ApiResponse<{ user: User | Trainer; tokens: AuthTokens }>>(
      '/auth/verify-otp',
      payload
    );
    return response.data;
  },

  resendOtp: async (email: string) => {
    const response = await api.post<ApiResponse<{ message: string }>>('/auth/resend-otp', {
      email,
    });
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await api.post<ApiResponse<{ message: string }>>('/auth/forgot-password', {
      email,
    });
    return response.data;
  },

  resetPassword: async (token: string, password: string) => {
    const response = await api.post<ApiResponse<{ message: string }>>('/auth/reset-password', {
      token,
      password,
    });
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get<ApiResponse<User | Trainer>>('/auth/profile');
    return response.data;
  },

  updateProfile: async (data: Partial<User | Trainer>) => {
    const response = await api.put<ApiResponse<User | Trainer>>('/auth/profile', data);
    return response.data;
  },

  logout: async () => {
    const response = await api.post<ApiResponse<{ message: string }>>('/auth/logout');
    return response.data;
  },
};
