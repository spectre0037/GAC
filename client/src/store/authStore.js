import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/axios';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      signup: async ({ fullName, email, password, regNo, whatsappNumber }) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post('/auth/signup', {
            fullName,
            email,
            password,
            regNo,
            whatsappNumber,
          });
          set({ user: data.user, token: data.token, isLoading: false });
          return { success: true };
        } catch (err) {
          const message = err.response?.data?.message || 'Signup failed. Please try again.';
          set({ error: message, isLoading: false });
          return { success: false, message };
        }
      },

      login: async ({ email, password }) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post('/auth/login', { email, password });
          set({ user: data.user, token: data.token, isLoading: false });
          return { success: true };
        } catch (err) {
          const message = err.response?.data?.message || 'Login failed. Please try again.';
          set({ error: message, isLoading: false });
          return { success: false, message };
        }
      },

      logout: () => {
        set({ user: null, token: null, error: null });
      },
      updateProfile: async (updates) => {
        try {
          const { data } = await api.patch('/auth/me', updates);
          set({ user: data.user });
          return { success: true };
        } catch (err) {
          return {
            success: false,
            message: err.response?.data?.message || 'Failed to update profile.',
          };
        }
      },

      uploadAvatar: async (file) => {
        try {
          const formData = new FormData();
          formData.append('avatar', file);
          const { data } = await api.post('/auth/me/avatar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          set({ user: data.user });
          return { success: true };
        } catch (err) {
          return {
            success: false,
            message: err.response?.data?.message || 'Failed to upload avatar.',
          };
        }
      },
      clearError: () => set({ error: null }),
    }),
    {
      name: 'gac-auth-storage', // localStorage key
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);