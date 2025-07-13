import { create } from 'zustand';
import { TaskState, Task } from '../types';
import { useAuthStore } from './authStore';
import { useToastStore } from './toastStore';
import { getSocket } from '../utils/socket';

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  isLoading: false,

  fetchTasks: async (vacationId: string) => {
    set({ isLoading: true });
    
    try {
      const { token } = useAuthStore.getState();
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${apiUrl}/tasks?vacationId=${vacationId}`, {
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
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${apiUrl}/tasks`, {
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
      
      // Show success toast
      useToastStore.getState().addToast({
        type: 'success',
        title: 'Task Created',
        message: `"${newTask.title}" has been added to your task list.`,
      });
    } catch (error) {
      set({ isLoading: false });
      useToastStore.getState().addToast({
        type: 'error',
        title: 'Failed to Create Task',
        message: error instanceof Error ? error.message : 'An unexpected error occurred.',
      });
      throw error;
    }
  },

  updateTask: async (id: string, data: Partial<Task>) => {
    set({ isLoading: true });
    
    try {
      const { token } = useAuthStore.getState();
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${apiUrl}/tasks/${id}`, {
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

      // Emit real-time update
      const socket = getSocket();
      if (socket) {
        const updatedTask = get().tasks.find(t => t.id === id);
        if (updatedTask) {
          socket.emit('task-update', {
            vacationId: updatedTask.vacationId,
            task: { ...updatedTask, ...data, updatedAt: new Date().toISOString() }
          });
          console.log('📡 [TaskStore] Emitted task update via socket');
        }
      }
      
      // Show success toast for status changes
      if (data.status) {
        const statusMessages = {
          'pending': 'Task marked as pending',
          'in-progress': 'Task started',
          'completed': 'Task completed! 🎉'
        };
        
        useToastStore.getState().addToast({
          type: 'success',
          title: 'Task Updated',
          message: statusMessages[data.status as keyof typeof statusMessages] || 'Task updated successfully',
        });
      }
    } catch (error) {
      set({ isLoading: false });
      useToastStore.getState().addToast({
        type: 'error',
        title: 'Failed to Update Task',
        message: error instanceof Error ? error.message : 'An unexpected error occurred.',
      });
      throw error;
    }
  },

  deleteTask: async (id: string) => {
    set({ isLoading: true });
    
    try {
      const { token } = useAuthStore.getState();
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${apiUrl}/tasks/${id}`, {
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
      
      useToastStore.getState().addToast({
        type: 'success',
        title: 'Task Deleted',
        message: 'Task has been removed from your list.',
      });
    } catch (error) {
      set({ isLoading: false });
      useToastStore.getState().addToast({
        type: 'error',
        title: 'Failed to Delete Task',
        message: error instanceof Error ? error.message : 'An unexpected error occurred.',
      });
      throw error;
    }
  },

  reorderTasks: (tasks: Task[]) => {
    set({ tasks });
  },

  // Real-time update handler
  handleRealTimeUpdate: (updatedTask: Task) => {
    console.log('🔄 [TaskStore] Handling real-time task update:', updatedTask.id);
    set(state => ({
      tasks: state.tasks.map(t => 
        t.id === updatedTask.id ? updatedTask : t
      )
    }));
  },
}));