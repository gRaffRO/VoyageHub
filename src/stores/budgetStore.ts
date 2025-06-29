import { create } from 'zustand';
import { Budget, Expense, BudgetCategory } from '../types';
import { useAuthStore } from './authStore';

interface BudgetState {
  budgets: Record<string, Budget>;
  isLoading: boolean;
  fetchBudget: (vacationId: string) => Promise<void>;
  updateBudget: (vacationId: string, data: Partial<Budget>) => Promise<void>;
  addExpense: (vacationId: string, expense: Partial<Expense>) => Promise<void>;
  updateExpense: (expenseId: string, data: Partial<Expense>) => Promise<void>;
  deleteExpense: (expenseId: string) => Promise<void>;
  checkBudgetAlert: (vacationId: string) => boolean;
}

export const useBudgetStore = create<BudgetState>((set, get) => ({
  budgets: {},
  isLoading: false,

  fetchBudget: async (vacationId: string) => {
    set({ isLoading: true });
    
    try {
      const { token } = useAuthStore.getState();
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${apiUrl}/budget/${vacationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch budget');
      }

      const budget = await response.json();
      set(state => ({
        budgets: { ...state.budgets, [vacationId]: budget },
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error fetching budget:', error);
      set({ isLoading: false });
    }
  },

  updateBudget: async (vacationId: string, data: Partial<Budget>) => {
    set({ isLoading: true });
    
    try {
      const { token } = useAuthStore.getState();
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${apiUrl}/budget/${vacationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update budget');
      }

      set(state => ({
        budgets: {
          ...state.budgets,
          [vacationId]: { ...state.budgets[vacationId], ...data }
        },
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  addExpense: async (vacationId: string, expenseData: Partial<Expense>) => {
    set({ isLoading: true });
    
    try {
      const { token } = useAuthStore.getState();
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${apiUrl}/budget/${vacationId}/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(expenseData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add expense');
      }

      const newExpense = await response.json();
      
      set(state => {
        const currentBudget = state.budgets[vacationId];
        if (currentBudget) {
          return {
            budgets: {
              ...state.budgets,
              [vacationId]: {
                ...currentBudget,
                expenses: [...currentBudget.expenses, newExpense]
              }
            },
            isLoading: false,
          };
        }
        return { isLoading: false };
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  updateExpense: async (expenseId: string, data: Partial<Expense>) => {
    set({ isLoading: true });
    
    try {
      const { token } = useAuthStore.getState();
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${apiUrl}/budget/expenses/${expenseId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update expense');
      }

      set(state => {
        const updatedBudgets = { ...state.budgets };
        Object.keys(updatedBudgets).forEach(vacationId => {
          const budget = updatedBudgets[vacationId];
          budget.expenses = budget.expenses.map(expense =>
            expense.id === expenseId ? { ...expense, ...data } : expense
          );
        });
        
        return { budgets: updatedBudgets, isLoading: false };
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  deleteExpense: async (expenseId: string) => {
    set({ isLoading: true });
    
    try {
      const { token } = useAuthStore.getState();
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${apiUrl}/budget/expenses/${expenseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete expense');
      }

      set(state => {
        const updatedBudgets = { ...state.budgets };
        Object.keys(updatedBudgets).forEach(vacationId => {
          const budget = updatedBudgets[vacationId];
          budget.expenses = budget.expenses.filter(expense => expense.id !== expenseId);
        });
        
        return { budgets: updatedBudgets, isLoading: false };
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  checkBudgetAlert: (vacationId: string) => {
    const { budgets } = get();
    const budget = budgets[vacationId];
    
    if (!budget || budget.totalBudget === 0) return false;
    
    const totalSpent = budget.expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const percentage = (totalSpent / budget.totalBudget) * 100;
    
    return percentage >= 75;
  },
}));