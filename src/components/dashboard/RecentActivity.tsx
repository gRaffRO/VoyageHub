import React, { useRef, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { useVacationStore } from '../../stores/vacationStore';
import { useTaskStore } from '../../stores/taskStore';
import { useBudgetStore } from '../../stores/budgetStore';
import { Calendar, CheckSquare, DollarSign, Users, Clock } from 'lucide-react';
import { gsap } from 'gsap';

export const RecentActivity: React.FC = () => {
  const { vacations } = useVacationStore();
  const { tasks } = useTaskStore();
  const { budgets } = useBudgetStore();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const items = containerRef.current.querySelectorAll('.activity-item');
      gsap.fromTo(items,
        { x: 50, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power2.out" }
      );
    }
  }, [vacations, tasks, budgets]); // Re-run animation when data changes

  // Generate activities from real data
  const activities = [];

  // Add vacation activities
  vacations.slice(0, 2).forEach(vacation => {
    activities.push({
      icon: Calendar,
      title: `Created "${vacation.title}"`,
      time: new Date(vacation.createdAt).toLocaleDateString(),
      color: 'text-blue-400'
    });
  });

  // Add task activities
  const completedTasks = tasks.filter(task => task.status === 'completed').slice(0, 2);
  completedTasks.forEach(task => {
    activities.push({
      icon: CheckSquare,
      title: `Completed "${task.title}"`,
      time: task.completedAt ? new Date(task.completedAt).toLocaleDateString() : 'Recently',
      color: 'text-green-400'
    });
  });

  // Add budget activities
  Object.values(budgets).slice(0, 1).forEach(budget => {
    if (budget.expenses.length > 0) {
      const latestExpense = budget.expenses[budget.expenses.length - 1];
      activities.push({
        icon: DollarSign,
        title: `Added expense: ${latestExpense.title}`,
        time: new Date(latestExpense.date).toLocaleDateString(),
        color: 'text-yellow-400'
      });
    }
  });

  // Add collaborator activities
  const sharedVacations = vacations.filter(v => v.collaborators.length > 0).slice(0, 1);
  sharedVacations.forEach(vacation => {
    activities.push({
      icon: Users,
      title: `Shared "${vacation.title}" with ${vacation.collaborators.length} collaborator${vacation.collaborators.length !== 1 ? 's' : ''}`,
      time: new Date(vacation.updatedAt).toLocaleDateString(),
      color: 'text-purple-400'
    });
  });

  // Sort by most recent and limit to 4
  const sortedActivities = activities
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 4);

  return (
    <Card glow>
      <CardHeader>
        <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
      </CardHeader>
      <CardContent ref={containerRef}>
        {sortedActivities.length > 0 ? (
          <div className="space-y-4">
            {sortedActivities.map((activity, index) => (
              <div key={index} className="activity-item glass-card p-4 rounded-xl hover-lift">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg bg-white/10 ${activity.color}`}>
                    <activity.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{activity.title}</p>
                    <div className="flex items-center space-x-1 mt-1">
                      <Clock className="h-3 w-3 text-white/40" />
                      <p className="text-xs text-white/60">{activity.time}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-white/40 mx-auto mb-4" />
            <p className="text-white/60">No recent activity</p>
            <p className="text-sm text-white/40 mt-2">
              Start planning your first vacation to see activity here
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};