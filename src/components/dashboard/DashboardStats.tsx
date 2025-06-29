import React, { useRef, useEffect } from 'react';
import { Card, CardContent } from '../ui/Card';
import { useVacationStore } from '../../stores/vacationStore';
import { useTaskStore } from '../../stores/taskStore';
import { useBudgetStore } from '../../stores/budgetStore';
import { useDocumentStore } from '../../stores/documentStore';
import { Calendar, CheckSquare, DollarSign, FileText } from 'lucide-react';
import { gsap } from 'gsap';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  color: string;
  index: number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, index }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(cardRef.current,
        { y: 30, opacity: 0, scale: 0.9 },
        { 
          y: 0, 
          opacity: 1, 
          scale: 1, 
          duration: 0.6, 
          delay: index * 0.1,
          ease: "back.out(1.7)" 
        }
      );
    }
  }, [index]);

  return (
    <Card hover glow>
      <CardContent className="p-6">
        <div ref={cardRef} className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white/70">{title}</p>
            <p className="text-3xl font-bold text-white mt-1">{value}</p>
          </div>
          <div className={`p-4 rounded-2xl ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const DashboardStats: React.FC = () => {
  const { vacations } = useVacationStore();
  const { tasks } = useTaskStore();
  const { budgets } = useBudgetStore();
  const { documents } = useDocumentStore();

  const activeVacations = vacations.filter(v => v.status === 'planning' || v.status === 'confirmed').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const totalBudget = Object.values(budgets).reduce((sum, budget) => sum + budget.totalBudget, 0);
  const totalDocuments = documents.length;

  const stats = [
    {
      title: 'Active Vacations',
      value: activeVacations.toString(),
      icon: Calendar,
      color: 'bg-gradient-to-r from-blue-500 to-blue-600',
    },
    {
      title: 'Pending Tasks',
      value: pendingTasks.toString(),
      icon: CheckSquare,
      color: 'bg-gradient-to-r from-yellow-500 to-orange-500',
    },
    {
      title: 'Total Budget',
      value: totalBudget > 0 ? `$${totalBudget.toLocaleString()}` : '$0',
      icon: DollarSign,
      color: 'bg-gradient-to-r from-green-500 to-emerald-500',
    },
    {
      title: 'Documents',
      value: totalDocuments.toString(),
      icon: FileText,
      color: 'bg-gradient-to-r from-purple-500 to-pink-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} index={index} />
      ))}
    </div>
  );
};