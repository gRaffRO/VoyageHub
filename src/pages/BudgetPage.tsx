import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { DatePicker } from '../components/ui/DatePicker';
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
  const [activeTab, setActiveTab] = useState<'expenses' | 'budget'>('expenses');
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
  
  // Separate budget spending from actual expenses
  const budgetSpent = currentBudget?.expenses.filter(expense => 
    currentBudget.categories.some(cat => cat.id === expense.categoryId && cat.allocated > 0)
  ).reduce((sum, expense) => sum + expense.amount, 0) || 0;
  
  const actualExpenses = currentBudget?.expenses.filter(expense => 
    !currentBudget.categories.some(cat => cat.id === expense.categoryId && cat.allocated > 0)
  ).reduce((sum, expense) => sum + expense.amount, 0) || 0;
  
  const totalVacationCost = budgetSpent + actualExpenses;
  const budgetRemaining = (currentBudget?.totalBudget || 0) - budgetSpent;
  const budgetUsedPercentage = currentBudget?.totalBudget ? (budgetSpent / currentBudget.totalBudget) * 100 : 0;

  // Check for budget alerts
  useEffect(() => {
    if (selectedVacationId && budgetUsedPercentage >= 75 && currentBudget?.totalBudget > 0) {
      addBudgetAlert(selectedVacationId, Math.round(budgetUsedPercentage));
    }
  }, [selectedVacationId, budgetUsedPercentage, addBudgetAlert, currentBudget?.totalBudget]);

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
          <h1 className="text-3xl font-bold text-white mb-2">Financial Management</h1>
          <p className="text-white/70">
            Track actual expenses and manage your vacation budget
          </p>
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

      {/* Tab Navigation */}
      <div className="animate-element">
        <Card>
          <CardContent className="p-0">
            <div className="flex">
              <button
                onClick={() => setActiveTab('expenses')}
                className={`flex-1 px-6 py-4 text-center font-medium transition-all ${
                  activeTab === 'expenses'
                    ? 'bg-blue-500/20 text-blue-300 border-b-2 border-blue-500'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                💳 Actual Expenses
                <span className="block text-xs text-white/50 mt-1">
                  Things you've already bought
                </span>
              </button>
              <button
                onClick={() => setActiveTab('budget')}
                className={`flex-1 px-6 py-4 text-center font-medium transition-all ${
                  activeTab === 'budget'
                    ? 'bg-green-500/20 text-green-300 border-b-2 border-green-500'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                📊 Budget Planning
                <span className="block text-xs text-white/50 mt-1">
                  How much you plan to spend
                </span>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="animate-element flex justify-end space-x-3">
        {activeTab === 'expenses' ? (
          <Button
            icon={Plus}
            onClick={() => setIsExpenseModalOpen(true)}
            glow
            disabled={!currentBudget}
          >
            Add Expense
          </Button>
        ) : (
          <Button
            icon={Settings}
            onClick={() => setIsBudgetModalOpen(true)}
            variant="glass"
          >
            Set Budget
          </Button>
        )}
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
                    <p className="text-sm font-medium text-white/70">Budget Spent</p>
                    <p className="text-2xl font-bold text-white">${budgetSpent.toLocaleString()}</p>
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
                    <p className="text-sm font-medium text-white/70">Budget Remaining</p>
                    <p className={`text-2xl font-bold ${budgetRemaining >= 0 ? 'text-white' : 'text-red-400'}`}>
                      ${budgetRemaining.toLocaleString()}
                    </p>
                  </div>
                  <div className={`w-12 h-12 bg-gradient-to-r ${budgetRemaining >= 0 ? 'from-green-500 to-green-600' : 'from-red-500 to-red-600'} rounded-2xl flex items-center justify-center`}>
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card glow>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white/70">Actual Expenses</p>
                    <p className="text-2xl font-bold text-white">${actualExpenses.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center">
                    <Receipt className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Stats Row */}
          <div className="animate-element grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card glow>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white/70">Total Vacation Cost</p>
                    <p className="text-2xl font-bold text-white">${totalVacationCost.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card glow>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white/70">Budget Usage</p>
                    <p className={`text-2xl font-bold ${budgetUsedPercentage >= 75 ? 'text-yellow-400' : 'text-white'}`}>
                      {budgetUsedPercentage.toFixed(1)}%
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                    <PieChart className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tab Content */}
          {activeTab === 'expenses' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Expense Categories */}
              <div className="animate-element">
                <Card glow>
                  <CardHeader>
                    <h3 className="text-lg font-semibold text-white">💳 Actual Expenses by Category</h3>
                    <p className="text-sm text-white/60">Money you've already spent</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {currentBudget.categories.map((category) => {
                      const categoryExpenses = currentBudget.expenses
                        .filter(expense => expense.categoryId === category.id)
                        .reduce((sum, expense) => sum + expense.amount, 0);
                      
                      if (categoryExpenses === 0) return null;
                      
                      return (
                        <div key={category.id} className="glass-card p-4 rounded-xl">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
                              <span className="text-white font-medium">{category.name}</span>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-white">${categoryExpenses.toLocaleString()}</p>
                              <p className="text-xs text-white/60">
                                {currentBudget.expenses.filter(e => e.categoryId === category.id).length} expense{currentBudget.expenses.filter(e => e.categoryId === category.id).length !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {currentBudget.expenses.length === 0 && (
                      <div className="text-center py-8">
                        <Receipt className="h-12 w-12 text-white/40 mx-auto mb-4" />
                        <p className="text-white/60">No expenses recorded yet</p>
                        <p className="text-sm text-white/40 mt-2">
                          Start adding your vacation expenses
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Recent Expenses */}
              <div className="animate-element">
                <Card glow>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Recent Purchases</h3>
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
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Budget Categories */}
              <div className="animate-element">
                <Card glow>
                  <CardHeader>
                    <h3 className="text-lg font-semibold text-white">📊 Budget Allocation</h3>
                    <p className="text-sm text-white/60">How much you plan to spend</p>
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

              {/* Budget vs Actual Comparison */}
              <div className="animate-element">
                <Card glow>
                  <CardHeader>
                    <h3 className="text-lg font-semibold text-white">Budget vs Actual</h3>
                    <p className="text-sm text-white/60">How you're doing against your plan</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="glass-card p-4 rounded-xl">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-sm text-white/60">Planned</p>
                          <p className="text-lg font-bold text-blue-400">${currentBudget.totalBudget.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-white/60">Budget Used</p>
                          <p className="text-lg font-bold text-red-400">${budgetSpent.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-white/60">Remaining</p>
                          <p className={`text-lg font-bold ${budgetRemaining >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            ${budgetRemaining.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="glass-card p-4 rounded-xl">
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <p className="text-sm text-white/60">Actual Expenses</p>
                          <p className="text-lg font-bold text-orange-400">${actualExpenses.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-white/60">Total Cost</p>
                          <p className="text-lg font-bold text-purple-400">${totalVacationCost.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="text-white font-medium">Category Performance</h4>
                      {currentBudget.categories
                        .filter(cat => cat.allocated > 0)
                        .map((category) => {
                          const categoryBudgetSpent = currentBudget.expenses
                            .filter(expense => expense.categoryId === category.id)
                            .reduce((sum, expense) => sum + expense.amount, 0);
                          const percentage = (categoryBudgetSpent / category.allocated) * 100;
                          const status = percentage > 100 ? 'over' : percentage > 75 ? 'warning' : 'good';
                          
                          return (
                            <div key={category.id} className="glass-card p-3 rounded-xl">
                              <div className="flex items-center justify-between">
                                <span className="text-white text-sm">{category.name}</span>
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs text-white/60">
                                    {percentage.toFixed(0)}%
                                  </span>
                                  <div className={`w-2 h-2 rounded-full ${
                                    status === 'over' ? 'bg-red-500' :
                                    status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                                  }`}></div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="animate-element text-center py-16">
          <div className="max-w-md mx-auto glass-card p-8 rounded-3xl">
            <DollarSign className="h-16 w-16 text-white/40 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No Budget Set</h3>
            <p className="text-white/60 mb-6">
              Set up your budget allocation to start financial planning
            </p>
            <Button
              icon={Settings}
              onClick={() => setIsBudgetModalOpen(true)}
              glow
            >
              Create Budget Plan
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
          
          <DatePicker
            label="Date"
            value={expenseForm.date}
            onChange={(date) => setExpenseForm(prev => ({ ...prev, date }))}
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