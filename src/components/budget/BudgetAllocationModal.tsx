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
  // Transportation
  { id: '1', name: 'Airplane Tickets', allocated: 0, spent: 0, color: 'bg-blue-500' },
  { id: '2', name: 'Train Tickets', allocated: 0, spent: 0, color: 'bg-indigo-500' },
  { id: '3', name: 'Bus/Coach', allocated: 0, spent: 0, color: 'bg-cyan-500' },
  { id: '4', name: 'Car Rental', allocated: 0, spent: 0, color: 'bg-teal-500' },
  { id: '5', name: 'Taxi/Uber/Local Transport', allocated: 0, spent: 0, color: 'bg-sky-500' },
  
  // Accommodation
  { id: '6', name: 'Hotels', allocated: 0, spent: 0, color: 'bg-green-500' },
  { id: '7', name: 'Airbnb/Vacation Rentals', allocated: 0, spent: 0, color: 'bg-emerald-500' },
  { id: '8', name: 'Hostels', allocated: 0, spent: 0, color: 'bg-lime-500' },
  
  // Food & Dining
  { id: '9', name: 'Restaurants', allocated: 0, spent: 0, color: 'bg-yellow-500' },
  { id: '10', name: 'Street Food/Local Cuisine', allocated: 0, spent: 0, color: 'bg-amber-500' },
  { id: '11', name: 'Groceries', allocated: 0, spent: 0, color: 'bg-orange-500' },
  { id: '12', name: 'Drinks/Beverages', allocated: 0, spent: 0, color: 'bg-red-500' },
  
  // Activities & Entertainment
  { id: '13', name: 'Tours & Excursions', allocated: 0, spent: 0, color: 'bg-purple-500' },
  { id: '14', name: 'Museums & Attractions', allocated: 0, spent: 0, color: 'bg-violet-500' },
  { id: '15', name: 'Entertainment/Shows', allocated: 0, spent: 0, color: 'bg-fuchsia-500' },
  { id: '16', name: 'Adventure Sports', allocated: 0, spent: 0, color: 'bg-pink-500' },
  
  // Technology & Communication
  { id: '17', name: 'eSIM/Mobile Data', allocated: 0, spent: 0, color: 'bg-slate-500' },
  { id: '18', name: 'WiFi/Internet', allocated: 0, spent: 0, color: 'bg-gray-500' },
  
  // Travel Essentials
  { id: '19', name: 'Travel Insurance', allocated: 0, spent: 0, color: 'bg-zinc-500' },
  { id: '20', name: 'Visa/Documentation', allocated: 0, spent: 0, color: 'bg-stone-500' },
  { id: '21', name: 'Luggage/Travel Gear', allocated: 0, spent: 0, color: 'bg-neutral-500' },
  
  // Shopping & Souvenirs
  { id: '22', name: 'Souvenirs', allocated: 0, spent: 0, color: 'bg-rose-500' },
  { id: '23', name: 'Clothing/Shopping', allocated: 0, spent: 0, color: 'bg-pink-400' },
  
  // Emergency & Miscellaneous
  { id: '24', name: 'Emergency Fund', allocated: 0, spent: 0, color: 'bg-red-600' },
  { id: '25', name: 'Tips & Service Charges', allocated: 0, spent: 0, color: 'bg-yellow-600' },
  { id: '26', name: 'Miscellaneous', allocated: 0, spent: 0, color: 'bg-gray-600' },
];
const travelTypePresets = {
  domestic: {
    name: 'Domestic Travel',
    categories: [
      'Train Tickets', 'Bus/Coach', 'Car Rental', 'Taxi/Uber/Local Transport',
      'Hotels', 'Airbnb/Vacation Rentals', 'Restaurants', 'Street Food/Local Cuisine',
      'Groceries', 'Tours & Excursions', 'Museums & Attractions', 'Souvenirs',
      'Emergency Fund', 'Miscellaneous'
    ]
  },
  continental: {
    name: 'Continental Travel',
    categories: [
      'Airplane Tickets', 'Train Tickets', 'Car Rental', 'Taxi/Uber/Local Transport',
      'Hotels', 'Airbnb/Vacation Rentals', 'Restaurants', 'Street Food/Local Cuisine',
      'Groceries', 'Tours & Excursions', 'Museums & Attractions', 'eSIM/Mobile Data',
      'Travel Insurance', 'Souvenirs', 'Emergency Fund', 'Miscellaneous'
    ]
  },
  intercontinental: {
    name: 'Intercontinental Travel',
    categories: [
      'Airplane Tickets', 'Taxi/Uber/Local Transport', 'Hotels', 'Airbnb/Vacation Rentals',
      'Restaurants', 'Street Food/Local Cuisine', 'Groceries', 'Tours & Excursions',
      'Museums & Attractions', 'Entertainment/Shows', 'eSIM/Mobile Data', 'WiFi/Internet',
      'Travel Insurance', 'Visa/Documentation', 'Luggage/Travel Gear', 'Souvenirs',
      'Clothing/Shopping', 'Emergency Fund', 'Tips & Service Charges', 'Miscellaneous'
    ]
  }
};

export const BudgetAllocationModal: React.FC<BudgetAllocationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialBudget = 0,
  initialCategories = defaultCategories,
}) => {
  const [totalBudget, setTotalBudget] = useState(initialBudget);
  const [categories, setCategories] = useState<BudgetCategory[]>(initialCategories);
  const [selectedTravelType, setSelectedTravelType] = useState<string>('');
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
      color: 'bg-indigo-500'
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
  const applyTravelTypePreset = (travelType: string) => {
    const preset = travelTypePresets[travelType as keyof typeof travelTypePresets];
    if (!preset) return;

    const presetCategories = defaultCategories.filter(cat => 
      preset.categories.includes(cat.name)
    );

    setCategories(presetCategories);
    setSelectedTravelType(travelType);
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