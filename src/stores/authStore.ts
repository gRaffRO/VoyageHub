import { create } from 'zustand';
import { AuthState, User, RegisterData } from '../types';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: null, // null = loading, false = not authenticated, true = authenticated
  isLoading: false,

  initializeAuth: async () => {
    set({ isLoading: true });
    
    const token = localStorage.getItem('voyagehub_token');
    const userData = localStorage.getItem('voyagehub_user');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (error) {
        // Clear invalid data
        localStorage.removeItem('voyagehub_token');
        localStorage.removeItem('voyagehub_user');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } else {
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    
    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }

      const { user, token } = await response.json();
      
      // Persist to localStorage
      localStorage.setItem('voyagehub_token', token);
      localStorage.setItem('voyagehub_user', JSON.stringify(user));
      
      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (userData: RegisterData) => {
    set({ isLoading: true });
    
    try {
      const response = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Registration failed');
      }

      const { user, token } = await response.json();
      
      // Persist to localStorage
      localStorage.setItem('voyagehub_token', token);
      localStorage.setItem('voyagehub_user', JSON.stringify(user));
      
      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    // Clear localStorage
    localStorage.removeItem('voyagehub_token');
    localStorage.removeItem('voyagehub_user');
    
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },

  updateProfile: async (data: Partial<User>) => {
    const { user, token } = get();
    set({ isLoading: true });
    
    try {
      const response = await fetch('http://localhost:3001/api/auth/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Profile update failed');
      }

      const updatedUser = {
        ...user!,
        ...data,
        updatedAt: new Date().toISOString(),
      };
      
      set({
        user: updatedUser,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
}));