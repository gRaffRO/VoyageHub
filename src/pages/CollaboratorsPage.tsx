import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { useVacationStore } from '../stores/vacationStore';
import { Plus, Search, Users, Mail, UserPlus, Crown, Shield, User, MessageCircle } from 'lucide-react';
import { gsap } from 'gsap';

export const CollaboratorsPage: React.FC = () => {
  const { vacations, fetchVacations } = useVacationStore();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'member' as 'member' | 'admin',
    message: '',
    vacationIds: [] as string[],
  });
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

  // Extract collaborators from vacations
  const allCollaborators = vacations.flatMap(vacation => 
    vacation.collaborators.map(email => ({
      id: email,
      email,
      name: email.split('@')[0], // Use email prefix as name for now
      role: 'member' as const,
      joinDate: vacation.createdAt,
      lastActive: vacation.updatedAt,
      vacations: [vacation.title],
      status: 'active' as const,
    }))
  );

  // Remove duplicates and merge vacation lists
  const uniqueCollaborators = allCollaborators.reduce((acc, collaborator) => {
    const existing = acc.find(c => c.email === collaborator.email);
    if (existing) {
      existing.vacations = [...new Set([...existing.vacations, ...collaborator.vacations])];
    } else {
      acc.push(collaborator);
    }
    return acc;
  }, [] as typeof allCollaborators);

  const filteredCollaborators = uniqueCollaborators.filter(collaborator => {
    const matchesSearch = collaborator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         collaborator.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || collaborator.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Here you would typically send the invitation
    console.log('Sending invitation:', inviteForm);
    
    // Reset form and close modal
    setInviteForm({
      email: '',
      role: 'member',
      message: '',
      vacationIds: [],
    });
    setIsInviteModalOpen(false);
  };

  const handleVacationToggle = (vacationId: string) => {
    setInviteForm(prev => ({
      ...prev,
      vacationIds: prev.vacationIds.includes(vacationId)
        ? prev.vacationIds.filter(id => id !== vacationId)
        : [...prev.vacationIds, vacationId]
    }));
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return Crown;
      case 'admin':
        return Shield;
      default:
        return User;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30';
      case 'admin':
        return 'bg-blue-500/20 text-blue-300 border-blue-400/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-400/30';
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div ref={pageRef} className="space-y-8 p-8">
      {/* Header */}
      <div className="animate-element flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Collaborators</h1>
          <p className="text-white/70">
            Manage your travel planning team and permissions
          </p>
        </div>
        <Button
          icon={UserPlus}
          onClick={() => setIsInviteModalOpen(true)}
          glow
          className="mt-4 sm:mt-0"
        >
          Invite Collaborator
        </Button>
      </div>

      {/* Stats */}
      <div className="animate-element grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/70">Total Members</p>
                <p className="text-2xl font-bold text-white">{uniqueCollaborators.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/70">Active</p>
                <p className="text-2xl font-bold text-white">
                  {uniqueCollaborators.filter(c => c.status === 'active').length}
                </p>
              </div>
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/70">Shared Vacations</p>
                <p className="text-2xl font-bold text-white">
                  {vacations.filter(v => v.collaborators.length > 0).length}
                </p>
              </div>
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                <Mail className="h-4 w-4 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/70">Avg. Collaborators</p>
                <p className="text-2xl font-bold text-white">
                  {vacations.length > 0 ? 
                    Math.round(vacations.reduce((sum, v) => sum + v.collaborators.length, 0) / vacations.length) : 
                    0
                  }
                </p>
              </div>
              <Shield className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="animate-element flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search collaborators..."
            icon={Search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="glass-select rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
          >
            <option value="all">All Roles</option>
            <option value="owner">Owner</option>
            <option value="admin">Admin</option>
            <option value="member">Member</option>
          </select>
        </div>
      </div>

      {/* Collaborators List */}
      <div className="animate-element space-y-4">
        {filteredCollaborators.length > 0 ? (
          filteredCollaborators.map((collaborator, index) => {
            const RoleIcon = getRoleIcon(collaborator.role);
            
            return (
              <Card key={collaborator.id} className="group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
                            {getInitials(collaborator.name)}
                          </span>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-800"></div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-1">
                          <h3 className="font-semibold text-white group-hover:text-blue-300 transition-colors">
                            {collaborator.name}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(collaborator.role)} flex items-center space-x-1`}>
                            <RoleIcon className="h-3 w-3" />
                            <span>{collaborator.role}</span>
                          </span>
                        </div>
                        
                        <p className="text-white/60 text-sm mb-2">{collaborator.email}</p>
                        
                        <div className="flex items-center space-x-6 text-sm text-white/50">
                          <span>Joined {new Date(collaborator.joinDate).toLocaleDateString()}</span>
                          <span>Last active: {new Date(collaborator.lastActive).toLocaleDateString()}</span>
                          <span>{collaborator.vacations.length} vacation{collaborator.vacations.length !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" icon={MessageCircle}>
                        Message
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
                        Remove
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto glass-card p-8 rounded-3xl">
              <Users className="h-16 w-16 text-white/40 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-white mb-2">No collaborators found</h3>
              <p className="text-white/60 mb-6">
                {searchTerm || filterRole !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Invite your first collaborator to start planning together'
                }
              </p>
              <Button
                icon={UserPlus}
                onClick={() => setIsInviteModalOpen(true)}
                glow
              >
                Invite Collaborator
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Invite Collaborator Modal */}
      <Modal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} title="Invite Collaborator">
        <form onSubmit={handleInviteSubmit} className="space-y-6">
          <Input
            label="Email Address"
            type="email"
            value={inviteForm.email}
            onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
            required
            placeholder="Enter email address"
            icon={Mail}
          />
          
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">Role</label>
            <select
              value={inviteForm.role}
              onChange={(e) => setInviteForm(prev => ({ ...prev, role: e.target.value as any }))}
              className="glass-select w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              <option value="member">Member - Can view and edit assigned tasks</option>
              <option value="admin">Admin - Can manage all aspects of vacations</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">Vacations to Share</label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {vacations.length > 0 ? (
                vacations.map((vacation) => (
                  <label key={vacation.id} className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={inviteForm.vacationIds.includes(vacation.id)}
                      onChange={() => handleVacationToggle(vacation.id)}
                      className="rounded border-white/30 bg-white/10 text-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-white">{vacation.title}</span>
                  </label>
                ))
              ) : (
                <p className="text-white/60 text-sm">No vacations available to share</p>
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">Personal Message (Optional)</label>
            <textarea
              value={inviteForm.message}
              onChange={(e) => setInviteForm(prev => ({ ...prev, message: e.target.value }))}
              rows={3}
              className="glass-input block w-full rounded-xl px-4 py-3 text-sm placeholder-white/60 focus:ring-2 focus:ring-white/30 focus:outline-none resize-none"
              placeholder="Add a personal message to the invitation..."
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setIsInviteModalOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" icon={Mail} glow className="flex-1">
              Send Invitation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};