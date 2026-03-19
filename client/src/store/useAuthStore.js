import { create } from 'zustand';
import axios from '../lib/axios';
import toast from 'react-hot-toast';

export const useAuthStore = create((set) => ({
  user: null,
  loading: false,

  checkAuth: async () => {
    try {
      const { data } = await axios.get('/auth/me');
      set({ user: data.user });
    } catch {
      set({ user: null });
    }
  },

  register: async (formData) => {
    set({ loading: true });
    try {
      const { data } = await axios.post('/auth/register', formData);
      toast.success(data.message || 'Account created! Please verify your email.');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
      return false;
    } finally {
      set({ loading: false });
    }
  },

  login: async (formData) => {
    set({ loading: true });
    try {
      const { data } = await axios.post('/auth/login', formData);
      set({ user: data.user });
      toast.success('Welcome back!');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
      return false;
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    try {
      await axios.post('/auth/logout');
      set({ user: null });
    } catch {
      toast.error('Logout failed');
    }
  },

  updateProfile: async (profileData) => {
    try {
      const { data } = await axios.put('/users/profile', profileData);
      set({ user: data.user });
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  }
}));