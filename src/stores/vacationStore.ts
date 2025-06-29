import { create } from 'zustand';
import { VacationState, Vacation } from '../types';
import { useAuthStore } from './authStore';

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

      const response = await fetch('http://localhost:3001/api/vacations', {
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
      const response = await fetch('http://localhost:3001/api/vacations', {
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
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  updateVacation: async (id: string, data: Partial<Vacation>) => {
    set({ isLoading: true });
    
    try {
      const { token } = useAuthStore.getState();
      const response = await fetch(`http://localhost:3001/api/vacations/${id}`, {
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
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  deleteVacation: async (id: string) => {
    set({ isLoading: true });
    
    try {
      const { token } = useAuthStore.getState();
      const response = await fetch(`http://localhost:3001/api/vacations/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete vacation');
      }

      set(state => ({
        vacations: state.vacations.filter(v => v.id !== id),
        currentVacation: state.currentVacation?.id === id ? null : state.currentVacation,
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  setCurrentVacation: (vacation: Vacation | null) => {
    set({ currentVacation: vacation });
  },
}));