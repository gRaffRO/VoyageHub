import { create } from 'zustand';
import { TaskState, Task } from '../types';
import { useAuthStore } from './authStore';

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  isLoading: false,

  fetchTasks: async (vacationId: string) => {
    set({ isLoading: true });
    
    try {
      const { token } = useAuthStore.getState();
      const response = await fetch(`http://localhost:3001/api/tasks?vacationId=${vacationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }

      const tasks = await response.json();
      set({ tasks, isLoading: false });
    } catch (error) {
      console.error('Error fetching tasks:', error);
      set({ tasks: [], isLoading: false });
    }
  },

  createTask: async (data: Partial<Task>) => {
    set({ isLoading: true });
    
    try {
      const { token } = useAuthStore.getState();
      const response = await fetch('http://localhost:3001/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create task');
      }

      const newTask = await response.json();
      
      set(state => ({
        tasks: [...state.tasks, newTask],
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  updateTask: async (id: string, data: Partial<Task>) => {
    set({ isLoading: true });
    
    try {
      const { token } = useAuthStore.getState();
      const response = await fetch(`http://localhost:3001/api/tasks/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update task');
      }

      set(state => ({
        tasks: state.tasks.map(t => 
          t.id === id ? { ...t, ...data, updatedAt: new Date().toISOString() } : t
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  deleteTask: async (id: string) => {
    set({ isLoading: true });
    
    try {
      const { token } = useAuthStore.getState();
      const response = await fetch(`http://localhost:3001/api/tasks/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete task');
      }

      set(state => ({
        tasks: state.tasks.filter(t => t.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  reorderTasks: (tasks: Task[]) => {
    set({ tasks });
  },
}));