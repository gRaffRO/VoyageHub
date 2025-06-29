import React, { useState, useRef, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { DollarSign, Plus, Trash2 } from 'lucide-react';
import { gsap } from 'gsap';

interface BudgetCategory {
  id: string;
  name: string;
  allocated: number;
  spent: number;
  color: string;
}

interface BudgetAllocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (totalBudget: number, categories: BudgetCategory[]) => void;
  initialBudget?: number;
  initialCategories?: BudgetCategory[];
}

const defaultCategories = [
  { id: '1', name: 'Transportation', allocated: 0, spent: 0, color: 'bg-blue-500' },
  { id: '2', name: 'Accommodation', allocated: 0, spent: 0, color: 'bg-green-500' },
  { id: '3', name: 'Food & Dining', allocated: 0, spent: 0, color: 'bg-yellow-500' },
  { id: '4', name: 'Activities', allocated: 0, spent: 0, color: 'bg-purple-500' },
  { id: '5', name: 'Shopping', allocated: 0, spent: 0, color: 'bg-pink-500' },
  { id: '6', name: 'Miscellaneous', allocated: 0, spent: 0, color: 'bg-gray-500' },
];

export const BudgetAllocationModal: React.FC<BudgetAllocationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialBudget = 0,
  initialCategories = defaultCategories,
}) => {
  const [totalBudget, setTotalBudget] = useState(initialBudget);
  const [categories, setCategories] = useState<BudgetCategory[]>(initialCategories);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (isOpen && formRef.current) {
      const elements = formRef.current.querySelectorAll('.form-element');
      gsap.fromTo(elements,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power2.out" }
      );
    }
  }, [isOpen]);

  const totalAllocated = categories.reduce((sum, cat) => sum + cat.allocated, 0);
  const remaining = totalBudget - totalAllocated;

  const handleCategoryChange = (id: string, allocated: number) => {
    setCategories(prev => prev.map(cat => 
      cat.id === id ? { ...cat, allocated } : cat
    ));
  };

  const addCategory = () => {
    const newCategory: BudgetCategory = {
      id: Date.now().toString(),
      name: '',
      allocated: 0,
      spent: 0,
      color: 'bg-indigo-500',
    };
    setCategories(prev => [...prev, newCategory]);
  };

  const removeCategory = (id: string) => {
    setCategories(prev => prev.filter(cat => cat.id !== id));
  };

  const updateCategoryName = (id: string, name: string) => {
    setCategories(prev => prev.map(cat => 
      cat.id === id ? { ...cat, name } : cat
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (totalBudget <= 0) {
      alert('Please enter a valid total budget');
      return;
    }

    if (totalAllocated > totalBudget) {
      alert('Total allocated amount cannot exceed the total budget');
      return;
    }

    const validCategories = categories
      .filter(cat => cat.name.trim() !== '')
      .map(cat => ({
        ...cat,
        spent: cat.spent ?? 0
      }));
    onSave(totalBudget, validCategories);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Set Budget Allocation" size="lg">
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        <div className="form-element">
          <Input
            type="number"
            label="Total Budget"
            icon={DollarSign}
            value={totalBudget}
            onChange={(e) => setTotalBudget(Number(e.target.value))}
            required
            min="0"
            step="0.01"
            placeholder="Enter total budget for this vacation"
          />
        </div>

        <div className="form-element">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-white">Budget Categories</h4>
            <Button type="button" variant="ghost" size="sm" icon={Plus} onClick={addCategory}>
              Add Category
            </Button>
          </div>

          <div className="space-y-4 max-h-64 overflow-y-auto">
            {categories.map((category, index) => (
              <div key={category.id} className="glass-card p-4 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${category.color}`}></div>
                  <div className="flex-1">
                    <Input
                      value={category.name}
                      onChange={(e) => updateCategoryName(category.id, e.target.value)}
                      placeholder="Category name"
                      className="mb-2"
                    />
                    <Input
                      type="number"
                      value={category.allocated}
                      onChange={(e) => handleCategoryChange(category.id, Number(e.target.value))}
                      placeholder="Allocated amount"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  {categories.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      icon={Trash2}
                      onClick={() => removeCategory(category.id)}
                      className="text-red-400 hover:text-red-300"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="form-element glass-card p-4 rounded-xl">
          <div className="flex justify-between items-center text-sm">
            <span className="text-white/70">Total Budget:</span>
            <span className="text-white font-medium">${totalBudget.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-white/70">Total Allocated:</span>
            <span className="text-white font-medium">${totalAllocated.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-sm border-t border-white/10 pt-2 mt-2">
            <span className="text-white/70">Remaining:</span>
            <span className={`font-medium ${remaining >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ${remaining.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="form-element flex space-x-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" icon={DollarSign} glow className="flex-1">
            Save Budget
          </Button>
        </div>
      </form>
    </Modal>
  );
};