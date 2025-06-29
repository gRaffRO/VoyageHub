import React, { useState, useEffect, useRef } from 'react';
import { useVacationStore } from '../stores/vacationStore';
import { VacationCard } from '../components/vacation/VacationCard';
import { CreateVacationModal } from '../components/vacation/CreateVacationModal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Plus, Search, Filter, MapPin } from 'lucide-react';
import { Vacation } from '../types';
import { gsap } from 'gsap';

export const VacationsPage: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  const { vacations, fetchVacations, isLoading } = useVacationStore();
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

  const filteredVacations = vacations.filter(vacation => {
    const matchesSearch = vacation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vacation.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || vacation.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const handleEditVacation = (vacation: Vacation) => {
    console.log('Edit vacation:', vacation);
  };

  const handleViewVacation = (vacation: Vacation) => {
    console.log('View vacation:', vacation);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="glass-card p-8 rounded-3xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="text-white/60 mt-4 text-center">Loading your adventures...</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={pageRef} className="space-y-8 p-8">
      {/* Header */}
      <div className="animate-element flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">My Vacations</h1>
          <p className="text-white/70">
            Plan and manage your upcoming adventures
          </p>
        </div>
        <Button
          icon={Plus}
          onClick={() => setIsCreateModalOpen(true)}
          glow
          className="mt-4 sm:mt-0"
        >
          Create Vacation
        </Button>
      </div>

      {/* Filters */}
      <div className="animate-element flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search vacations..."
            icon={Search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-white/60" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="glass-select rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
          >
            <option value="all">All Status</option>
            <option value="planning">Planning</option>
            <option value="confirmed">Confirmed</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Vacations Grid */}
      {filteredVacations.length > 0 ? (
        <div className="animate-element grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVacations.map((vacation, index) => (
            <div
              key={vacation.id}
              className="vacation-card"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <VacationCard
                vacation={vacation}
                onEdit={handleEditVacation}
                onView={handleViewVacation}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="animate-element text-center py-16">
          <div className="max-w-md mx-auto glass-card p-8 rounded-3xl">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
              {searchTerm || filterStatus !== 'all' ? (
                <Search className="h-10 w-10 text-white" />
              ) : (
                <MapPin className="h-10 w-10 text-white" />
              )}
            </div>
            <h3 className="text-xl font-medium text-white mb-2">
              {searchTerm || filterStatus !== 'all' ? 'No vacations found' : 'No vacations yet'}
            </h3>
            <p className="text-white/60 mb-6">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Start planning your next adventure by creating your first vacation'
              }
            </p>
            {!searchTerm && filterStatus === 'all' && (
              <Button
                icon={Plus}
                onClick={() => setIsCreateModalOpen(true)}
                glow
              >
                Create Your First Vacation
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Create Vacation Modal */}
      <CreateVacationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};