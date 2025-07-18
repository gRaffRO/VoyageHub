import { create } from 'zustand';
import { VacationState, Vacation } from '../types';
import { useAuthStore } from './authStore';
import { useToastStore } from './toastStore';

export const useVacationStore = create<VacationState>((set, get) => ({
  vacations: [],
  currentVacation: null,
  isLoading: false,

  fetchVacations: async () => {
    set({ isLoading: true });
    
    try {
      const { token } = useAuthStore.getState();
      if (!token) {
        set({ vacations: [], isLoading: false });
        return;
      }

      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${apiUrl}/vacations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch vacations');
      }

      const vacations = await response.json();
      set({ vacations, isLoading: false });
    } catch (error) {
      console.error('Error fetching vacations:', error);
      set({ vacations: [], isLoading: false });
    }
  },

  createVacation: async (data: Partial<Vacation>) => {
    set({ isLoading: true });
    
    try {
      const { token } = useAuthStore.getState();
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${apiUrl}/vacations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create vacation');
      }

      const newVacation = await response.json();
      
      set(state => ({
        vacations: [...state.vacations, newVacation],
        isLoading: false,
      }));
      
      useToastStore.getState().addToast({
        type: 'success',
        title: 'Vacation Created',
        message: `"${newVacation.title}" has been added to your vacation list.`,
      });
    } catch (error) {
      set({ isLoading: false });
      useToastStore.getState().addToast({
        type: 'error',
        title: 'Failed to Create Vacation',
        message: error instanceof Error ? error.message : 'An unexpected error occurred.',
      });
      throw error;
    }
  },

  updateVacation: async (id: string, data: Partial<Vacation>) => {
    set({ isLoading: true });
    
    try {
      const { token } = useAuthStore.getState();
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${apiUrl}/vacations/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update vacation');
      }

      set(state => ({
        vacations: state.vacations.map(v => 
          v.id === id ? { ...v, ...data, updatedAt: new Date().toISOString() } : v
        ),
        currentVacation: state.currentVacation?.id === id 
          ? { ...state.currentVacation, ...data, updatedAt: new Date().toISOString() }
          : state.currentVacation,
        isLoading: false,
      }));
      
      useToastStore.getState().addToast({
        type: 'success',
        title: 'Vacation Updated',
        message: 'Your vacation details have been saved.',
      });
    } catch (error) {
      set({ isLoading: false });
      useToastStore.getState().addToast({
        type: 'error',
        title: 'Failed to Update Vacation',
        message: error instanceof Error ? error.message : 'An unexpected error occurred.',
      });
      throw error;
    }
  },

  deleteVacation: async (id: string) => {
    console.log('🔄 [VacationStore] deleteVacation called for ID:', id);
    set({ isLoading: true });
    
    try {
      const { token } = useAuthStore.getState();
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      console.log('🔄 [VacationStore] Making DELETE request...');
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${apiUrl}/vacations/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 [VacationStore] Delete response status:', response.status);

      if (!response.ok) {
        let error;
        try {
          error = await response.json();
        } catch (parseError) {
          error = { error: `HTTP ${response.status}: ${response.statusText}` };
        }
        console.error('❌ [VacationStore] Delete request failed:', error);
        throw new Error(error.error || 'Failed to delete vacation');
      }

      console.log('✅ [VacationStore] Vacation deleted from server, updating local state...');
      set(state => ({
        vacations: state.vacations.filter(v => v.id !== id),
        currentVacation: state.currentVacation?.id === id ? null : state.currentVacation,
        isLoading: false,
      }));
      console.log('✅ [VacationStore] Local state updated successfully');
      
      // Return success to indicate the operation completed
      useToastStore.getState().addToast({
        type: 'success',
        title: 'Vacation Deleted',
        message: 'Vacation and all associated data have been removed.',
      });
      
      return true;
    } catch (error) {
      console.error('❌ [VacationStore] Delete vacation error:', error);
      set({ isLoading: false });
      useToastStore.getState().addToast({
        type: 'error',
        title: 'Failed to Delete Vacation',
        message: error instanceof Error ? error.message : 'An unexpected error occurred.',
      });
      throw error;
    }
  },

  setCurrentVacation: (vacation: Vacation | null) => {
    set({ currentVacation: vacation });
  },
}));