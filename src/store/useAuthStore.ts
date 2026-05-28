import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserPreferences } from '../types';
import axios from 'axios';

export interface AuthUser extends User {
  assignedProjectId?: string | null;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password?: string) => Promise<void>;
  register: (name: string, email: string, password?: string) => Promise<void>;
  logout: () => void;
  updateProfile: (name: string, email: string, avatar: string) => Promise<void>;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null, // Default to null (Guest Reader by default!)
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password?: string) => {
        set({ isLoading: true, error: null });
        try {
          const res = await axios.post('/api/auth/login', { email, password });
          if (res.data.success) {
            set({ user: res.data.data, isAuthenticated: true, isLoading: false });
          } else {
            const errMsg = res.data.message || res.data.error || 'Login failed';
            set({ error: errMsg, isLoading: false });
            throw new Error(errMsg);
          }
        } catch (err: any) {
          const errMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Login failed';
          set({ 
            error: errMsg, 
            isLoading: false 
          });
          throw new Error(errMsg);
        }
      },

      register: async (name: string, email: string, password?: string) => {
        set({ isLoading: true, error: null });
        try {
          const res = await axios.post('/api/auth/register', { name, email, password });
          if (res.data.success) {
            set({ user: res.data.data, isAuthenticated: true, isLoading: false });
          } else {
            const errMsg = res.data.message || res.data.error || 'Registration failed';
            set({ error: errMsg, isLoading: false });
            throw new Error(errMsg);
          }
        } catch (err: any) {
          const errMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Registration failed';
          set({ 
            error: errMsg, 
            isLoading: false 
          });
          throw new Error(errMsg);
        }
      },

      logout: () => set({ user: null, isAuthenticated: false, error: null }),

      updateProfile: async (name: string, email: string, avatar: string) => {
        set({ isLoading: true, error: null });
        try {
          const currentUser = get().user;
          if (!currentUser) throw new Error('No user is currently logged in');

          const res = await axios.put('/api/auth/update', {
            id: currentUser.id,
            name,
            email,
            avatar
          });

          if (res.data.success) {
            set({ user: res.data.data, isLoading: false });
          } else {
            const errMsg = res.data.message || 'Update failed';
            set({ error: errMsg, isLoading: false });
            throw new Error(errMsg);
          }
        } catch (err: any) {
          const errMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Update failed';
          set({ error: errMsg, isLoading: false });
          throw new Error(errMsg);
        }
      },

      updatePreferences: async (preferences: Partial<UserPreferences>) => {
        set({ isLoading: true, error: null });
        try {
          const currentUser = get().user;
          if (!currentUser) throw new Error('No user is currently logged in');

          const res = await axios.put('/api/auth/update', {
            id: currentUser.id,
            preferences
          });

          if (res.data.success) {
            set({ user: res.data.data, isLoading: false });
          } else {
            const errMsg = res.data.message || 'Update failed';
            set({ error: errMsg, isLoading: false });
            throw new Error(errMsg);
          }
        } catch (err: any) {
          const errMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Update failed';
          set({ error: errMsg, isLoading: false });
          throw new Error(errMsg);
        }
      },
    }),
    {
      name: 'nexus-auth',
    }
  )
);
