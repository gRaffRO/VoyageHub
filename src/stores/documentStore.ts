import { create } from 'zustand';
import { Document } from '../types';
import { useAuthStore } from './authStore';

interface DocumentState {
  documents: Document[];
  isLoading: boolean;
  fetchDocuments: (vacationId: string) => Promise<void>;
  uploadDocument: (file: File, data: Partial<Document>) => Promise<void>;
  updateDocument: (id: string, data: Partial<Document>) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  previewDocument: (id: string) => Promise<string>;
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  documents: [],
  isLoading: false,

  fetchDocuments: async (vacationId: string) => {
    set({ isLoading: true });
    
    try {
      const { token } = useAuthStore.getState();
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${apiUrl}/documents?vacationId=${vacationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }

      const documents = await response.json();
      set({ documents, isLoading: false });
    } catch (error) {
      console.error('Error fetching documents:', error);
      set({ documents: [], isLoading: false });
    }
  },

  uploadDocument: async (file: File, data: Partial<Document>) => {
    set({ isLoading: true });
    
    try {
      const { token } = useAuthStore.getState();
      const formData = new FormData();
      formData.append('file', file);
      formData.append('vacationId', data.vacationId || '');
      formData.append('title', data.title || '');
      formData.append('type', data.type || 'other');
      if (data.expirationDate) {
        formData.append('expirationDate', data.expirationDate);
      }

      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${apiUrl}/documents/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload document');
      }

      const newDocument = await response.json();
      
      set(state => ({
        documents: [...state.documents, newDocument],
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  updateDocument: async (id: string, data: Partial<Document>) => {
    set({ isLoading: true });
    
    try {
      const { token } = useAuthStore.getState();
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${apiUrl}/documents/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update document');
      }

      set(state => ({
        documents: state.documents.map(d => 
          d.id === id ? { ...d, ...data, updatedAt: new Date().toISOString() } : d
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  deleteDocument: async (id: string) => {
    set({ isLoading: true });
    
    try {
      const { token } = useAuthStore.getState();
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${apiUrl}/documents/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete document');
      }

      set(state => ({
        documents: state.documents.filter(d => d.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  previewDocument: async (id: string) => {
    try {
      const { token } = useAuthStore.getState();
      const document = get().documents.find(d => d.id === id);
      
      if (!document) {
        throw new Error('Document not found');
      }

      // Return the file URL for preview
      return document.fileUrl;
    } catch (error) {
      console.error('Error getting document preview:', error);
      throw error;
    }
  },
}));