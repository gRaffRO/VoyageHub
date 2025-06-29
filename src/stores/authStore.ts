import { create } from 'zustand';
import { AuthState, User, RegisterData } from '../types';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: null, // null = loading, false = not authenticated, true = authenticated
  isLoading: false,

  initializeAuth: async () => {
    console.log('🔄 [AuthStore] Starting initializeAuth...');
    
    try {
      set({ isLoading: true });
      console.log('🔄 [AuthStore] Set isLoading to true');
    
      const token = localStorage.getItem('voyagehub_token');
      const userData = localStorage.getItem('voyagehub_user');
      
      console.log('🔍 [AuthStore] Checking localStorage:', {
        hasToken: !!token,
        hasUserData: !!userData,
        tokenLength: token?.length || 0,
        userDataLength: userData?.length || 0
      });
    
      if (token && userData) {
        console.log('✅ [AuthStore] Found stored credentials, parsing user data...');
        try {
          const user = JSON.parse(userData);
          console.log('✅ [AuthStore] Successfully parsed user data:', {
            userId: user.id,
            email: user.email,
            firstName: user.firstName
          });
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
          console.log('✅ [AuthStore] Set authenticated state to true');
        } catch (error) {
          console.error('❌ [AuthStore] Error parsing stored user data:', error);
          // Clear invalid data
          localStorage.removeItem('voyagehub_token');
          localStorage.removeItem('voyagehub_user');
          console.log('🧹 [AuthStore] Cleared invalid localStorage data');
          
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
          console.log('❌ [AuthStore] Set authenticated state to false (invalid data)');
        }
      } else {
        console.log('ℹ️ [AuthStore] No stored credentials found');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
        console.log('❌ [AuthStore] Set authenticated state to false (no credentials)');
      }
      
      console.log('✅ [AuthStore] initializeAuth completed successfully');
    } catch (error) {
      console.error('❌ [AuthStore] Error in initializeAuth:', error);
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
      console.log('❌ [AuthStore] Set authenticated state to false (error)');
    }
  },

  login: async (email: string, password: string) => {
    console.log('🔄 [AuthStore] Starting login for:', email);
    set({ isLoading: true });
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      console.log('🌐 [AuthStore] Making login request to:', `${apiUrl}/auth/login`);
      
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('📡 [AuthStore] Login response status:', response.status);

      if (!response.ok) {
        const error = await response.json();
        console.error('❌ [AuthStore] Login failed:', error);
        throw new Error(error.error || 'Login failed');
      }

      const { user, token } = await response.json();
      console.log('✅ [AuthStore] Login successful for user:', user.email);
      
      // Persist to localStorage
      localStorage.setItem('voyagehub_token', token);
      localStorage.setItem('voyagehub_user', JSON.stringify(user));
      console.log('💾 [AuthStore] Saved credentials to localStorage');
      
      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
      console.log('✅ [AuthStore] Updated auth state after login');
    } catch (error) {
      console.error('❌ [AuthStore] Login error:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (userData: RegisterData) => {
    console.log('🔄 [AuthStore] Starting registration for:', userData.email);
    set({ isLoading: true });
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      console.log('🌐 [AuthStore] Making registration request to:', `${apiUrl}/auth/register`);
      
      const response = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      console.log('📡 [AuthStore] Registration response status:', response.status);

      if (!response.ok) {
        const error = await response.json();
        console.error('❌ [AuthStore] Registration failed:', error);
        throw new Error(error.error || 'Registration failed');
      }

      const { user, token } = await response.json();
      console.log('✅ [AuthStore] Registration successful for user:', user.email);
      
      // Persist to localStorage
      localStorage.setItem('voyagehub_token', token);
      localStorage.setItem('voyagehub_user', JSON.stringify(user));
      console.log('💾 [AuthStore] Saved credentials to localStorage');
      
      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
      console.log('✅ [AuthStore] Updated auth state after registration');
    } catch (error) {
      console.error('❌ [AuthStore] Registration error:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    console.log('🔄 [AuthStore] Starting logout...');
    // Clear localStorage
    localStorage.removeItem('voyagehub_token');
    localStorage.removeItem('voyagehub_user');
    console.log('🧹 [AuthStore] Cleared localStorage');
    
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
    console.log('✅ [AuthStore] Logout completed');
  },

  updateProfile: async (data: Partial<User>) => {
    const { user, token } = get();
    console.log('🔄 [AuthStore] Starting profile update...');
    set({ isLoading: true });
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${apiUrl}/auth/profile`, {
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
      console.log('✅ [AuthStore] Profile updated successfully');
    } catch (error) {
      console.error('❌ [AuthStore] Profile update error:', error);
      set({ isLoading: false });
      throw error;
    }
  },
}));