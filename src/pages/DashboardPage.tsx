import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardStats } from '../components/dashboard/DashboardStats';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { useVacationStore } from '../stores/vacationStore';
import { CreateVacationModal } from '../components/vacation/CreateVacationModal';
import { Button } from '../components/ui/Button';
import { Plus, Calendar, TrendingUp, MapPin, Users, Star } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { gsap } from 'gsap';

export const DashboardPage: React.FC = () => {
  const { vacations, fetchVacations } = useVacationStore();
  const [isCreateVacationModalOpen, setIsCreateVacationModalOpen] = React.useState(false);
  const navigate = useNavigate();
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

  const upcomingVacations = vacations
    .filter(v => new Date(v.startDate) > new Date())
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 3);

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'new-vacation':
        setIsCreateVacationModalOpen(true);
        break;
      case 'add-task':
        navigate('/tasks');
        break;
      case 'view-budget':
        navigate('/budget');
        break;
      case 'upload-document':
        navigate('/documents');
        break;
      default:
        break;
    }
  };

  return (
    <div ref={pageRef} className="space-y-8 p-8">
      {/* Welcome Section */}
      <div className="animate-element glass-card rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-700/20"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 gradient-text">Welcome back!</h1>
            <p className="text-white/80 text-lg">
              Ready to plan your next adventure?
            </p>
            <div className="flex items-center space-x-6 mt-4">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-blue-300" />
                <span className="text-sm text-white/70">{vacations.length} Destination{vacations.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-green-300" />
                <span className="text-sm text-white/70">
                  {vacations.reduce((sum, v) => sum + v.collaborators.length, 0)} Collaborator{vacations.reduce((sum, v) => sum + v.collaborators.length, 0) !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-yellow-300" />
                <span className="text-sm text-white/70">Premium Member</span>
              </div>
            </div>
          </div>
          <Button
            variant="glass"
            icon={Plus}
            onClick={() => handleQuickAction('new-vacation')}
            glow
            className="bg-white/20 hover:bg-white/30"
          >
            New Vacation
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="animate-element">
        <DashboardStats />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upcoming Vacations */}
        <div className="lg:col-span-2 animate-element">
          <Card glow>
            <CardHeader className="flex flex-row items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Upcoming Vacations</h3>
              <Button variant="ghost" size="sm" icon={Calendar}>
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {upcomingVacations.length > 0 ? (
                <div className="space-y-4">
                  {upcomingVacations.map((vacation, index) => (
                    <div
                      key={vacation.id}
                      className="glass-card p-4 rounded-xl hover-lift cursor-pointer group"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-white group-hover:text-blue-300 transition-colors">
                            {vacation.title}
                          </h4>
                          <p className="text-sm text-white/60">
                            {new Date(vacation.startDate).toLocaleDateString()} - 
                            {new Date(vacation.endDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-white">
                            {vacation.destinations.length} destinations
                          </p>
                          <p className="text-xs text-white/60">
                            {vacation.collaborators.length + 1} travelers
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-white/40 mx-auto mb-4" />
                  <p className="text-white/60">No upcoming vacations</p>
                  <Button variant="ghost" size="sm" className="mt-2">
                    Plan your first vacation
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="animate-element">
          <RecentActivity />
        </div>
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
                className="h-20 flex-col space-y-2 hover-lift"
                onClick={() => handleQuickAction('new-vacation')}
              >
                <Plus className="h-6 w-6" />
                <span className="text-sm">New Vacation</span>
              </Button>
              <Button 
                variant="glass" 
                className="h-20 flex-col space-y-2 hover-lift"
                onClick={() => handleQuickAction('add-task')}
              >
                <Calendar className="h-6 w-6" />
                <span className="text-sm">Add Task</span>
              </Button>
              <Button 
                variant="glass" 
                className="h-20 flex-col space-y-2 hover-lift"
                onClick={() => handleQuickAction('view-budget')}
              >
                <TrendingUp className="h-6 w-6" />
                <span className="text-sm">View Budget</span>
              </Button>
              <Button 
                variant="glass" 
                className="h-20 flex-col space-y-2 hover-lift"
                onClick={() => handleQuickAction('upload-document')}
              >
                <Plus className="h-6 w-6" />
                <span className="text-sm">Upload Document</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Vacation Modal */}
      <CreateVacationModal
        isOpen={isCreateVacationModalOpen}
        onClose={() => setIsCreateVacationModalOpen(false)}
      />
    </div>
  );
};