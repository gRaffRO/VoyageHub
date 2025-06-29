import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { BudgetAllocationModal } from '../components/budget/BudgetAllocationModal';
import { useBudgetStore } from '../stores/budgetStore';
import { useVacationStore } from '../stores/vacationStore';
import { useNotificationStore } from '../stores/notificationStore';
import { Plus, DollarSign, TrendingUp, TrendingDown, PieChart, Receipt, Settings, AlertTriangle } from 'lucide-react';
import { gsap } from 'gsap';

interface ExpenseFormData {
  title: string;
  amount: number;
  categoryId: string;
  date: string;
  description: string;
}

export const BudgetPage: React.FC = () => {
  const [selectedVacationId, setSelectedVacationId] = useState<string>('');
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [expenseForm, setExpenseForm] = useState<ExpenseFormData>({
    title: '',
    amount: 0,
    categoryId: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
  });

  const { budgets, isLoading, fetchBudget, updateBudget, addExpense, checkBudgetAlert } = useBudgetStore();
  const { vacations, fetchVacations } = useVacationStore();
  const { addBudgetAlert } = useNotificationStore();
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchVacations();
  }, [fetchVacations]);

  useEffect(() => {
    if (vacations.length > 0 && !selectedVacationId) {
      setSelectedVacationId(vacations[0].id);
    }
  }, [vacations, selectedVacationId]);

  useEffect(() => {
    if (selectedVacationId) {
      fetchBudget(selectedVacationId);
    }
  }, [selectedVacationId, fetchBudget]);

  useEffect(() => {
    if (pageRef.current) {
      const elements = pageRef.current.querySelectorAll('.animate-element');
      gsap.fromTo(elements,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power3.out" }
      );
    }
  }, []);

  const currentBudget = selectedVacationId ? budgets[selectedVacationId] : null;
  const totalSpent = currentBudget?.expenses.reduce((sum, expense) => sum + expense.amount, 0) || 0;
  const remaining = (currentBudget?.totalBudget || 0) - totalSpent;
  const budgetUsedPercentage = currentBudget?.totalBudget ? (totalSpent / currentBudget.totalBudget) * 100 : 0;

  // Check for budget alerts
  useEffect(() => {
    if (selectedVacationId && checkBudgetAlert(selectedVacationId) && budgetUsedPercentage >= 75) {
      addBudgetAlert(selectedVacationId, Math.round(budgetUsedPercentage));
    }
  }, [selectedVacationId, budgetUsedPercentage, checkBudgetAlert, addBudgetAlert]);

  const handleBudgetSave = async (totalBudget: number, categories: any[]) => {
    if (selectedVacationId) {
      // Round totalBudget to 2 decimal places to match database DECIMAL(10,2) format
      const roundedBudget = Math.round(totalBudget * 100) / 100;
      
      await updateBudget(selectedVacationId, {
        totalBudget: roundedBudget,
        categories,
      });
    }
  };

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedVacationId) return;

    try {
      await addExpense(selectedVacationId, expenseForm);
      setExpenseForm({
        title: '',
        amount: 0,
        categoryId: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
      });
      setIsExpenseModalOpen(false);
    } catch (error) {
      console.error('Failed to add expense:', error);
    }
  };

  if (vacations.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96 p-8">
        <div className="text-center glass-card p-8 rounded-3xl">
          <DollarSign className="h-16 w-16 text-white/40 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-white mb-2">No Vacations Found</h3>
          <p className="text-white/60">Create a vacation first to manage its budget</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={pageRef} className="space-y-8 p-8">
      {/* Header */}
      <div className="animate-element flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Budget Tracking</h1>
          <p className="text-white/70">
            Monitor your vacation expenses and stay within budget
          </p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <Button
            icon={Settings}
            onClick={() => setIsBudgetModalOpen(true)}
            variant="glass"
          >
            Set Budget
          </Button>
          <Button
            icon={Plus}
            onClick={() => setIsExpenseModalOpen(true)}
            glow
            disabled={!currentBudget}
          >
            Add Expense
          </Button>
        </div>
      </div>

      {/* Vacation Selector */}
      <div className="animate-element">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <label className="text-white font-medium">Select Vacation:</label>
              <select
                value={selectedVacationId}
                onChange={(e) => setSelectedVacationId(e.target.value)}
                className="glass-select rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                {vacations.map((vacation) => (
                  <option key={vacation.id} value={vacation.id}>
                    {vacation.title}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>
      </div>

      {currentBudget ? (
        <>
          {/* Budget Alert */}
          {budgetUsedPercentage >= 75 && (
            <div className="animate-element">
              <Card className="border-2 border-yellow-400/50">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-6 w-6 text-yellow-400" />
                    <div>
                      <h3 className="text-lg font-medium text-yellow-400">Budget Alert</h3>
                      <p className="text-white/70">
                        You have used {budgetUsedPercentage.toFixed(1)}% of your budget for this vacation.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Budget Overview */}
          <div className="animate-element grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card glow>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white/70">Total Budget</p>
                    <p className="text-2xl font-bold text-white">${currentBudget.totalBudget.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card glow>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white/70">Total Spent</p>
                    <p className="text-2xl font-bold text-white">${totalSpent.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl flex items-center justify-center">
                    <TrendingDown className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card glow>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white/70">Remaining</p>
                    <p className={`text-2xl font-bold ${remaining >= 0 ? 'text-white' : 'text-red-400'}`}>
                      ${remaining.toLocaleString()}
                    </p>
                  </div>
                  <div className={`w-12 h-12 bg-gradient-to-r ${remaining >= 0 ? 'from-green-500 to-green-600' : 'from-red-500 to-red-600'} rounded-2xl flex items-center justify-center`}>
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card glow>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white/70">Budget Used</p>
                    <p className={`text-2xl font-bold ${budgetUsedPercentage >= 75 ? 'text-yellow-400' : 'text-white'}`}>
                      {budgetUsedPercentage.toFixed(1)}%
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center">
                    <PieChart className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Budget Categories */}
            <div className="animate-element">
              <Card glow>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-white">Budget Categories</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  {currentBudget.categories.map((category) => {
                    const categorySpent = currentBudget.expenses
                      .filter(expense => expense.categoryId === category.id)
                      .reduce((sum, expense) => sum + expense.amount, 0);
                    const percentage = category.allocated > 0 ? (categorySpent / category.allocated) * 100 : 0;
                    const isOverBudget = categorySpent > category.allocated;
                    
                    return (
                      <div key={category.id} className="glass-card p-4 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
                            <span className="text-white font-medium">{category.name}</span>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-medium ${isOverBudget ? 'text-red-400' : 'text-white'}`}>
                              ${categorySpent.toLocaleString()} / ${category.allocated.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${
                              isOverBudget ? 'bg-red-500' : category.color
                            }`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-white/60 mt-1">
                          {percentage.toFixed(1)}% used
                          {isOverBudget && (
                            <span className="text-red-400 ml-2">Over budget!</span>
                          )}
                        </p>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            {/* Recent Expenses */}
            <div className="animate-element">
              <Card glow>
                <CardHeader className="flex flex-row items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Recent Expenses</h3>
                  <Button variant="ghost" size="sm" icon={Receipt}>
                    View All
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {currentBudget.expenses.length > 0 ? (
                    currentBudget.expenses.slice(0, 6).map((expense) => {
                      const category = currentBudget.categories.find(cat => cat.id === expense.categoryId);
                      
                      return (
                        <div key={expense.id} className="glass-card p-4 rounded-xl hover-lift">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`w-3 h-3 rounded-full ${category?.color || 'bg-gray-500'}`}></div>
                              <div>
                                <h4 className="font-medium text-white">{expense.title}</h4>
                                <p className="text-sm text-white/60">{category?.name || 'Uncategorized'}</p>
                                <p className="text-xs text-white/40">{new Date(expense.date).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-white">${expense.amount.toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8">
                      <Receipt className="h-12 w-12 text-white/40 mx-auto mb-4" />
                      <p className="text-white/60">No expenses yet</p>
                      <p className="text-sm text-white/40 mt-2">
                        Add your first expense to start tracking
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      ) : (
        <div className="animate-element text-center py-16">
          <div className="max-w-md mx-auto glass-card p-8 rounded-3xl">
            <DollarSign className="h-16 w-16 text-white/40 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No Budget Set</h3>
            <p className="text-white/60 mb-6">
              Set up your budget allocation to start tracking expenses
            </p>
            <Button
              icon={Settings}
              onClick={() => setIsBudgetModalOpen(true)}
              glow
            >
              Set Budget
            </Button>
          </div>
        </div>
      )}

      {/* Budget Allocation Modal */}
      <BudgetAllocationModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        onSave={handleBudgetSave}
        initialBudget={currentBudget?.totalBudget}
        initialCategories={currentBudget?.categories}
      />

      {/* Add Expense Modal */}
      <Modal isOpen={isExpenseModalOpen} onClose={() => setIsExpenseModalOpen(false)} title="Add New Expense">
        <form onSubmit={handleExpenseSubmit} className="space-y-6">
          <Input
            label="Expense Title"
            value={expenseForm.title}
            onChange={(e) => setExpenseForm(prev => ({ ...prev, title: e.target.value }))}
            required
            placeholder="Enter expense description"
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              label="Amount"
              value={expenseForm.amount}
              onChange={(e) => setExpenseForm(prev => ({ ...prev, amount: Number(e.target.value) }))}
              required
              min="0"
              step="0.01"
              placeholder="0.00"
            />
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">Category</label>
              <select
                value={expenseForm.categoryId}
                onChange={(e) => setExpenseForm(prev => ({ ...prev, categoryId: e.target.value }))}
                className="glass-select w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
                required
              >
                <option value="">Select category</option>
                {currentBudget?.categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <Input
            type="date"
            label="Date"
            value={expenseForm.date}
            onChange={(e) => setExpenseForm(prev => ({ ...prev, date: e.target.value }))}
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">Description (Optional)</label>
            <textarea
              value={expenseForm.description}
              onChange={(e) => setExpenseForm(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="glass-input block w-full rounded-xl px-4 py-3 text-sm placeholder-white/60 focus:ring-2 focus:ring-white/30 focus:outline-none resize-none"
              placeholder="Additional details..."
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setIsExpenseModalOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" icon={Plus} glow className="flex-1" disabled={isLoading}>
              Add Expense
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};