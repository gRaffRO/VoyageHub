import React, { useEffect, useRef } from 'react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { useVacationStore } from '../stores/vacationStore';
import { useBudgetStore } from '../stores/budgetStore';
import { useTaskStore } from '../stores/taskStore';
import { TrendingUp, TrendingDown, BarChart3, PieChart, Calendar, DollarSign, MapPin, Users, Star } from 'lucide-react';
import { gsap } from 'gsap';

export const AnalyticsPage: React.FC = () => {
  const { vacations, fetchVacations } = useVacationStore();
  const { budgets } = useBudgetStore();
  const { tasks } = useTaskStore();
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchVacations();
  }, [fetchVacations]);

  useEffect(() => {
    if (pageRef.current) {
      const elements = pageRef.current.querySelectorAll('.animate-element');
      gsap.fromTo(elements,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power3.out" }
      );
    }
  }, []);

  // Calculate analytics from real data
  const totalTrips = vacations.length;
  const completedTrips = vacations.filter(v => v.status === 'completed').length;
  const totalSpent = Object.values(budgets).reduce((sum, budget) => 
    sum + budget.expenses.reduce((expSum, exp) => expSum + exp.amount, 0), 0
  );
  const totalBudget = Object.values(budgets).reduce((sum, budget) => sum + budget.totalBudget, 0);
  const completedTasks = tasks.filter(t => t.status === 'completed').length;

  // Get unique destinations
  const destinations = vacations.flatMap(v => v.destinations);
  const uniqueCountries = [...new Set(destinations.map(d => d.country))].length;

  const metrics = [
    {
      title: 'Total Trips',
      value: totalTrips.toString(),
      change: completedTrips > 0 ? `${completedTrips} completed` : 'No completed trips yet',
      trend: 'up',
      icon: Calendar,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Total Spent',
      value: `$${totalSpent.toLocaleString()}`,
      change: totalBudget > 0 ? `${((totalSpent / totalBudget) * 100).toFixed(1)}% of budget` : 'No budget set',
      trend: totalSpent <= totalBudget ? 'up' : 'down',
      icon: DollarSign,
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Countries Visited',
      value: uniqueCountries.toString(),
      change: destinations.length > uniqueCountries ? `${destinations.length} destinations` : 'Explore more!',
      trend: 'up',
      icon: MapPin,
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Tasks Completed',
      value: completedTasks.toString(),
      change: tasks.length > 0 ? `${tasks.length} total tasks` : 'No tasks yet',
      trend: 'up',
      icon: Users,
      color: 'from-pink-500 to-pink-600'
    }
  ];

  // Calculate monthly spending (last 6 months)
  const monthlySpending = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = month.toLocaleDateString('en-US', { month: 'short' });
    
    const monthExpenses = Object.values(budgets).flatMap(budget => 
      budget.expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === month.getMonth() && 
               expenseDate.getFullYear() === month.getFullYear();
      })
    );
    
    const amount = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    monthlySpending.push({ month: monthName, amount });
  }

  // Get top destinations by visit count
  const destinationCounts = destinations.reduce((acc, dest) => {
    const key = `${dest.city}, ${dest.country}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topDestinations = Object.entries(destinationCounts)
    .map(([name, visits]) => ({
      name,
      visits,
      spending: Object.values(budgets)
        .flatMap(budget => budget.expenses)
        .filter(expense => expense.description?.toLowerCase().includes(name.toLowerCase()))
        .reduce((sum, exp) => sum + exp.amount, 0)
    }))
    .sort((a, b) => b.visits - a.visits)
    .slice(0, 5);

  return (
    <div ref={pageRef} className="space-y-8 p-8">
      {/* Header */}
      <div className="animate-element">
        <h1 className="text-3xl font-bold text-white mb-2">Vacation Cost Analytics</h1>
        <p className="text-white/70">
          Analyze your vacation costs and spending patterns
        </p>
      </div>

      {/* Key Metrics */}
      <div className="animate-element grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <Card key={metric.title} glow>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${metric.color} rounded-2xl flex items-center justify-center`}>
                  <metric.icon className="h-6 w-6 text-white" />
                </div>
                {metric.trend === 'up' ? (
                  <TrendingUp className="h-5 w-5 text-green-400" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-400" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-white/70">{metric.title}</p>
                <p className="text-2xl font-bold text-white mt-1">{metric.value}</p>
                <p className="text-sm text-green-400 mt-1">{metric.change}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Cost Breakdown */}
      <div className="animate-element">
        <Card glow>
          <CardHeader>
            <h3 className="text-lg font-semibold text-white">Vacation Cost Breakdown</h3>
          </CardHeader>
          <CardContent>
            {vacations.length > 0 ? (
              <div className="space-y-4">
                {vacations.map((vacation) => {
                  const vacationBudget = budgets[vacation.id];
                  const vacationSpent = vacationBudget?.expenses.reduce((sum, exp) => sum + exp.amount, 0) || 0;
                  const vacationPlanned = vacationBudget?.totalBudget || 0;
                  const costPerDay = vacationSpent > 0 ? 
                    vacationSpent / Math.ceil((new Date(vacation.endDate).getTime() - new Date(vacation.startDate).getTime()) / (1000 * 60 * 60 * 24)) : 0;
                  
                  return (
                    <div key={vacation.id} className="glass-card p-4 rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-white">{vacation.title}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          vacation.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                          vacation.status === 'active' ? 'bg-blue-500/20 text-blue-300' :
                          'bg-yellow-500/20 text-yellow-300'
                        }`}>
                          {vacation.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-white/60">Planned Budget</p>
                          <p className="text-white font-medium">${vacationPlanned.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-white/60">Actual Spent</p>
                          <p className="text-white font-medium">${vacationSpent.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-white/60">Cost per Day</p>
                          <p className="text-white font-medium">${costPerDay.toFixed(0)}</p>
                        </div>
                        <div>
                          <p className="text-white/60">Budget Usage</p>
                          <p className={`font-medium ${
                            vacationPlanned > 0 ? 
                              (vacationSpent / vacationPlanned > 1 ? 'text-red-400' : 
                               vacationSpent / vacationPlanned > 0.8 ? 'text-yellow-400' : 'text-green-400')
                            : 'text-white'
                          }`}>
                            {vacationPlanned > 0 ? `${((vacationSpent / vacationPlanned) * 100).toFixed(1)}%` : 'N/A'}
                          </p>
                        </div>
                      </div>
                      
                      {vacationBudget && vacationBudget.expenses.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-white/10">
                          <p className="text-xs text-white/60 mb-2">Top Expense Categories:</p>
                          <div className="flex flex-wrap gap-2">
                            {vacationBudget.categories
                              .map(cat => ({
                                ...cat,
                                spent: vacationBudget.expenses
                                  .filter(exp => exp.categoryId === cat.id)
                                  .reduce((sum, exp) => sum + exp.amount, 0)
                              }))
                              .filter(cat => cat.spent > 0)
                              .sort((a, b) => b.spent - a.spent)
                              .slice(0, 3)
                              .map(cat => (
                                <span key={cat.id} className="px-2 py-1 bg-white/10 rounded-full text-xs text-white/80">
                                  {cat.name}: ${cat.spent.toLocaleString()}
                                </span>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <DollarSign className="h-12 w-12 text-white/40 mx-auto mb-4" />
                <p className="text-white/60">No vacation cost data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Spending Trends */}
        <div className="animate-element">
          <Card glow>
            <CardHeader className="flex flex-row items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Monthly Spending Trends</h3>
              <BarChart3 className="h-5 w-5 text-white/60" />
            </CardHeader>
            <CardContent>
              {monthlySpending.length > 0 ? (
                <div className="space-y-4">
                  {monthlySpending.map((month, index) => {
                    const maxAmount = Math.max(...monthlySpending.map(m => m.amount));
                    const percentage = maxAmount > 0 ? (month.amount / maxAmount) * 100 : 0;
                    
                    return (
                      <div key={month.month} className="flex items-center space-x-4">
                        <div className="w-8 text-sm text-white/70">{month.month}</div>
                        <div className="flex-1">
                          <div className="w-full bg-white/10 rounded-full h-3">
                            <div
                              className="h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-1000"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="w-20 text-sm text-white text-right">${month.amount.toLocaleString()}</div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-white/40 mx-auto mb-4" />
                  <p className="text-white/60">No spending data available</p>
                  <p className="text-sm text-white/40 mt-2">
                    Add expenses to see spending trends
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top Destinations */}
        <div className="animate-element">
          <Card glow>
            <CardHeader className="flex flex-row items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Top Destinations</h3>
              <MapPin className="h-5 w-5 text-white/60" />
            </CardHeader>
            <CardContent>
              {topDestinations.length > 0 ? (
                <div className="space-y-4">
                  {topDestinations.map((destination, index) => (
                    <div key={destination.name} className="glass-card p-4 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-white">{destination.name}</h4>
                          <p className="text-sm text-white/60">{destination.visits} visit{destination.visits !== 1 ? 's' : ''}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-white">${destination.spending.toLocaleString()}</p>
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-xs text-white/60">#{index + 1}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MapPin className="h-12 w-12 text-white/40 mx-auto mb-4" />
                  <p className="text-white/60">No destinations yet</p>
                  <p className="text-sm text-white/40 mt-2">
                    Plan your first vacation to see analytics
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Additional Analytics Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Travel Frequency */}
        <div className="animate-element">
          <Card glow>
            <CardHeader>
              <h3 className="text-lg font-semibold text-white">Travel Frequency</h3>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-12 w-12 text-white" />
                </div>
                <p className="text-2xl font-bold text-white">
                  {completedTrips > 0 ? (completedTrips / Math.max(1, new Date().getFullYear() - 2023)).toFixed(1) : '0'}
                </p>
                <p className="text-sm text-white/60">trips per year</p>
                <p className="text-xs text-green-400 mt-2">
                  {completedTrips > 2 ? 'Active traveler' : completedTrips > 0 ? 'Getting started' : 'Plan your first trip'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Budget Efficiency */}
        <div className="animate-element">
          <Card glow>
            <CardHeader>
              <h3 className="text-lg font-semibold text-white">Budget Efficiency</h3>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PieChart className="h-12 w-12 text-white" />
                </div>
                <p className="text-2xl font-bold text-white">
                  {totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0}%
                </p>
                <p className="text-sm text-white/60">budget utilization</p>
                <p className="text-xs text-blue-400 mt-2">
                  {totalBudget > 0 ? 
                    (totalSpent / totalBudget > 0.9 ? 'High utilization' : 
                     totalSpent / totalBudget > 0.7 ? 'Good planning' : 'Conservative spending') 
                    : 'Set budgets to track'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Travel Score */}
        <div className="animate-element">
          <Card glow>
            <CardHeader>
              <h3 className="text-lg font-semibold text-white">Travel Score</h3>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-12 w-12 text-white" />
                </div>
                <p className="text-2xl font-bold text-white">
                  {Math.min(10, Math.round((completedTrips * 2 + uniqueCountries + (completedTasks / 10)) * 10) / 10)}
                </p>
                <p className="text-sm text-white/60">out of 10</p>
                <p className="text-xs text-purple-400 mt-2">
                  {totalTrips > 5 ? 'Expert traveler' : totalTrips > 2 ? 'Experienced' : 'Beginner'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Insights */}
      <div className="animate-element">
        <Card glow>
          <CardHeader>
            <h3 className="text-lg font-semibold text-white">Travel Insights</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-4 rounded-xl">
                <h4 className="font-medium text-white mb-2">Most Active Season</h4>
                <p className="text-white/60 text-sm">
                  {vacations.length > 0 ? 
                    'Analyze your travel patterns by adding more trips' : 
                    'Plan multiple vacations to see seasonal trends'
                  }
                </p>
              </div>
              <div className="glass-card p-4 rounded-xl">
                <h4 className="font-medium text-white mb-2">Spending Pattern</h4>
                <p className="text-white/60 text-sm">
                  {Object.values(budgets).length > 0 ? 
                    'Track expenses across categories to see spending patterns' : 
                    'Add expenses to analyze your spending habits'
                  }
                </p>
              </div>
              <div className="glass-card p-4 rounded-xl">
                <h4 className="font-medium text-white mb-2">Travel Style</h4>
                <p className="text-white/60 text-sm">
                  {destinations.length > 0 ? 
                    'Your travel preferences will emerge as you add more destinations' : 
                    'Plan trips to discover your travel style'
                  }
                </p>
              </div>
              <div className="glass-card p-4 rounded-xl">
                <h4 className="font-medium text-white mb-2">Planning Efficiency</h4>
                <p className="text-white/60 text-sm">
                  {tasks.length > 0 ? 
                    `${Math.round((completedTasks / tasks.length) * 100)}% task completion rate` : 
                    'Create tasks to track planning efficiency'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};