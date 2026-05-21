import { create } from 'zustand';
import storage from '../utils/storage';
import api from '../services/api';
import { User, Trainer } from '../types';

interface AuthState {
  user: (User | Trainer) | null;
  role: 'user' | 'trainer' | 'admin' | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;

  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: any, role: string) => void;
  loadStoredAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  role: null,
  isAuthenticated: false,
  isLoading: true,
  accessToken: null,

  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    const { user, accessToken, refreshToken, role } = response.data.data;

    await storage.setItem('accessToken', accessToken);
    await storage.setItem('refreshToken', refreshToken);
    await storage.setItem('userData', JSON.stringify(user));
    await storage.setItem('userRole', role || user.role || 'user');

    set({
      user,
      role: role || user.role || 'user',
      isAuthenticated: true,
      accessToken,
    });
  },

  register: async (data: any) => {
    const response = await api.post('/auth/register', data);
    const { user, accessToken, refreshToken } = response.data.data;
    const role = data.role || 'user';

    await storage.setItem('accessToken', accessToken);
    await storage.setItem('refreshToken', refreshToken);
    await storage.setItem('userData', JSON.stringify(user));
    await storage.setItem('userRole', role);

    set({ user, role, isAuthenticated: true, accessToken });
  },

  logout: async () => {
    await storage.deleteItem('accessToken');
    await storage.deleteItem('refreshToken');
    await storage.deleteItem('userData');
    await storage.deleteItem('userRole');
    set({ user: null, role: null, isAuthenticated: false, accessToken: null });
  },

  setUser: (user: any, role: string) => {
    set({ user, role: role as any, isAuthenticated: true });
  },

  loadStoredAuth: async () => {
    try {
      const token = await storage.getItem('accessToken');
      const userData = await storage.getItem('userData');
      const userRole = await storage.getItem('userRole');

      if (token && userData) {
        set({
          user: JSON.parse(userData),
          role: (userRole as any) || 'user',
          isAuthenticated: true,
          accessToken: token,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));
