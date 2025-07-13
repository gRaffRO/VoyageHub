import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useVacationStore } from '../stores/vacationStore';
import { useTaskStore } from '../stores/taskStore';
import { useBudgetStore } from '../stores/budgetStore';
import { useDocumentStore } from '../stores/documentStore';
import { CalendarView } from '../components/calendar/CalendarView';
import { ActivityManager } from '../components/activities/ActivityManager';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  CheckSquare, 
  FileText,
  Edit,
  Plus,
  Clock
} from 'lucide-react';
import { gsap } from 'gsap';

export const VacationDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { vacations, fetchVacations } = useVacationStore();
  const { tasks, fetchTasks } = useTaskStore();
  const { budgets, fetchBudget } = useBudgetStore();
  const { documents, fetchDocuments } = useDocumentStore();
  const pageRef = useRef<HTMLDivElement>(null);

  const vacation = vacations.find(v => v.id === id);

  useEffect(() => {
    if (!vacation) {
      fetchVacations();
    }
  }, [vacation, fetchVacations]);

  useEffect(() => {
    if (id) {
      fetchTasks(id);
      fetchBudget(id);
      fetchDocuments(id);
    }
  }, [id, fetchTasks, fetchBudget, fetchDocuments]);

  useEffect(() => {
    if (pageRef.current) {
      const elements = pageRef.current.querySelectorAll('.animate-element');
      gsap.fromTo(elements,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power3.out" }
      );
    }
  }, [vacation]);

  if (!vacation) {
    return (
      <div className="flex items-center justify-center min-h-96 p-8">
        <div className="text-center glass-card p-8 rounded-3xl">
          <Calendar className="h-16 w-16 text-white/40 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-white mb-2">Vacation Not Found</h3>
          <p className="text-white/60">The vacation you're looking for doesn't exist or has been deleted.</p>
          <Button onClick={() => navigate('/vacations')} className="mt-4">
            Back to Vacations
          </Button>
        </div>
      </div>
    );
  }

  const currentBudget = budgets[vacation.id];
  const totalSpent = currentBudget?.expenses.reduce((sum, expense) => sum + expense.amount, 0) || 0;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;

  // Mock activities data - in real app this would come from a store
  const mockActivities = [
    {
      id: '1',
      title: 'Visit Eiffel Tower',
      description: 'Iconic landmark visit with photo opportunities',
      date: vacation.startDate,
      time: '10:00',
      duration: 120,
      cost: 25,
      currency: 'EUR',
      category: 'sightseeing' as const,
      location: 'Champ de Mars, Paris',
      bookingRequired: true,
      confirmationNumber: 'ET123456',
    },
    {
      id: '2',
      title: 'Seine River Cruise',
      description: 'Romantic evening cruise along the Seine',
      date: vacation.startDate,
      time: '19:00',
      duration: 90,
      cost: 45,
      currency: 'EUR',
      category: 'entertainment' as const,
      location: 'Port de la Bourdonnais',
      bookingRequired: true,
    },
  ];

  // Convert tasks and activities to calendar events
  const calendarEvents = [
    ...tasks.map(task => ({
      id: task.id,
      title: task.title,
      date: task.dueDate || vacation.startDate,
      type: 'task' as const,
      color: 'bg-blue-500/80 text-white',
      description: task.description,
    })),
    ...mockActivities.map(activity => ({
      id: activity.id,
      title: activity.title,
      date: activity.date,
      time: activity.time,
      type: 'activity' as const,
      color: 'bg-green-500/80 text-white',
      description: activity.description,
      location: activity.location,
    })),
  ];

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30';
      case 'confirmed':
        return 'bg-blue-500/20 text-blue-300 border-blue-400/30';
      case 'active':
        return 'bg-green-500/20 text-green-300 border-green-400/30';
      case 'completed':
        return 'bg-gray-500/20 text-gray-300 border-gray-400/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-400/30';
    }
  };

  const getDaysUntil = () => {
    const today = new Date();
    const startDate = new Date(vacation.startDate);
    const diffTime = startDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
      return `${diffDays} days until departure`;
    } else if (diffDays === 0) {
      return 'Departing today!';
    } else {
      const endDate = new Date(vacation.endDate);
      const endDiffTime = endDate.getTime() - today.getTime();
      const endDiffDays = Math.ceil(endDiffTime / (1000 * 60 * 60 * 24));
      
      if (endDiffDays >= 0) {
        return 'Currently on vacation!';
      } else {
        return 'Vacation completed';
      }
    }
  };

  return (
    <div ref={pageRef} className="space-y-8 p-8">
      {/* Header */}
      <div className="animate-element flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            icon={ArrowLeft}
            onClick={() => navigate('/vacations')}
          >
            Back to Vacations
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">{vacation.title}</h1>
            <p className="text-white/70">{vacation.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(vacation.status)}`}>
            {vacation.status}
          </span>
          <Button
            variant="glass"
            icon={Edit}
            onClick={() => navigate('/vacations')}
          >
            Edit
          </Button>
        </div>
      </div>

      {/* Trip Overview */}
      <div className="animate-element">
        <Card glow>
          <CardHeader>
            <h3 className="text-lg font-semibold text-white">Trip Overview</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <Calendar className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                <p className="text-sm text-white/60">Duration</p>
                <p className="text-lg font-semibold text-white">
                  {Math.ceil((new Date(vacation.endDate).getTime() - new Date(vacation.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                </p>
              </div>
              <div className="text-center">
                <MapPin className="h-8 w-8 text-green-400 mx-auto mb-2" />
                <p className="text-sm text-white/60">Destinations</p>
                <p className="text-lg font-semibold text-white">{vacation.destinations.length}</p>
              </div>
              <div className="text-center">
                <Users className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                <p className="text-sm text-white/60">Travelers</p>
                <p className="text-lg font-semibold text-white">{vacation.collaborators.length + 1}</p>
              </div>
              <div className="text-center">
                <Clock className="h-8 w-8 text-orange-400 mx-auto mb-2" />
                <p className="text-sm text-white/60">Status</p>
                <p className="text-lg font-semibold text-white">{getDaysUntil()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dates and Destinations */}
      <div className="animate-element grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-white">Travel Dates</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="glass-card p-4 rounded-xl">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-green-400" />
                <div>
                  <p className="text-sm text-white/60">Departure</p>
                  <p className="text-white font-medium">{formatDate(vacation.startDate)}</p>
                </div>
              </div>
            </div>
            <div className="glass-card p-4 rounded-xl">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-red-400" />
                <div>
                  <p className="text-sm text-white/60">Return</p>
                  <p className="text-white font-medium">{formatDate(vacation.endDate)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-white">Destinations</h3>
          </CardHeader>
          <CardContent>
            {vacation.destinations.length > 0 ? (
              <div className="space-y-3">
                {vacation.destinations.map((destination, index) => (
                  <div key={destination.id} className="glass-card p-4 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-blue-400" />
                      <div>
                        <p className="font-medium text-white">{destination.name}</p>
                        <p className="text-sm text-white/60">{destination.city}, {destination.country}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MapPin className="h-12 w-12 text-white/40 mx-auto mb-4" />
                <p className="text-white/60">No destinations added yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="animate-element grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card hover onClick={() => navigate(`/tasks?vacation=${vacation.id}`)}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/70">Tasks</p>
                <p className="text-2xl font-bold text-white">{tasks.length}</p>
                <p className="text-sm text-green-400">{completedTasks} completed</p>
              </div>
              <CheckSquare className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card hover onClick={() => navigate(`/budget?vacation=${vacation.id}`)}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/70">Budget</p>
                <p className="text-2xl font-bold text-white">
                  ${currentBudget?.totalBudget?.toLocaleString() || '0'}
                </p>
                <p className="text-sm text-yellow-400">${totalSpent.toLocaleString()} spent</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card hover onClick={() => navigate(`/documents?vacation=${vacation.id}`)}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/70">Documents</p>
                <p className="text-2xl font-bold text-white">{documents.length}</p>
                <p className="text-sm text-purple-400">Stored securely</p>
              </div>
              <FileText className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Collaborators */}
      {vacation.collaborators.length > 0 && (
        <div className="animate-element">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-white">Collaborators</h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vacation.collaborators.map((email, index) => (
                  <div key={email} className="glass-card p-4 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{email}</p>
                        <p className="text-sm text-white/60">Collaborator</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Calendar View */}
      <div className="animate-element">
        <CalendarView
          events={calendarEvents}
          startDate={vacation.startDate}
          endDate={vacation.endDate}
          onEventClick={(event) => {
            console.log('Event clicked:', event);
          }}
          onDateClick={(date) => {
            console.log('Date clicked:', date);
          }}
          onAddEvent={(date) => {
            console.log('Add event for date:', date);
          }}
        />
      </div>

      {/* Activity Manager */}
      <div className="animate-element">
        <ActivityManager
          vacationId={vacation.id}
          activities={mockActivities}
          onActivityCreate={(activity) => {
            console.log('Create activity:', activity);
          }}
          onActivityUpdate={(id, activity) => {
            console.log('Update activity:', id, activity);
          }}
          onActivityDelete={(id) => {
            console.log('Delete activity:', id);
          }}
        />
      </div>

      {/* Quick Actions */}
      <div className="animate-element">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button 
                variant="glass" 
                className="h-20 flex-col space-y-2"
                onClick={() => navigate(`/tasks?vacation=${vacation.id}`)}
              >
                <Plus className="h-6 w-6" />
                <span className="text-sm">Add Task</span>
              </Button>
              <Button 
                variant="glass" 
                className="h-20 flex-col space-y-2"
                onClick={() => navigate(`/budget?vacation=${vacation.id}`)}
              >
                <DollarSign className="h-6 w-6" />
                <span className="text-sm">Manage Budget</span>
              </Button>
              <Button 
                variant="glass" 
                className="h-20 flex-col space-y-2"
                onClick={() => navigate(`/documents?vacation=${vacation.id}`)}
              >
                <FileText className="h-6 w-6" />
                <span className="text-sm">Upload Document</span>
              </Button>
              <Button 
                variant="glass" 
                className="h-20 flex-col space-y-2"
                onClick={() => navigate(`/collaborators`)}
              >
                <Users className="h-6 w-6" />
                <span className="text-sm">Invite People</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};