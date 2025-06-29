import React, { useState, useRef, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useVacationStore } from '../../stores/vacationStore';
import { Plus, Calendar, MapPin, Users, Trash2, X } from 'lucide-react';
import { gsap } from 'gsap';

interface CreateVacationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Destination {
  id: string;
  name: string;
  country: string;
  city: string;
  startDate: string;
  endDate: string;
}

export const CreateVacationModal: React.FC<CreateVacationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
  });
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [collaborators, setCollaborators] = useState<string[]>([]);
  const [newDestination, setNewDestination] = useState({
    name: '',
    country: '',
    city: '',
    startDate: '',
    endDate: '',
  });
  const [newCollaboratorEmail, setNewCollaboratorEmail] = useState('');
  const [error, setError] = useState('');
  
  const { createVacation, isLoading } = useVacationStore();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (isOpen && formRef.current) {
      const elements = formRef.current.querySelectorAll('.form-element');
      gsap.fromTo(elements,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power2.out" }
      );
    }
  }, [isOpen, currentStep]);

  const resetForm = () => {
    setCurrentStep(1);
    setFormData({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
    });
    setDestinations([]);
    setCollaborators([]);
    setNewDestination({
      name: '',
      country: '',
      city: '',
      startDate: '',
      endDate: '',
    });
    setNewCollaboratorEmail('');
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleNextStep = () => {
    setError('');
    
    if (currentStep === 1) {
      if (!formData.title || !formData.startDate || !formData.endDate) {
        setError('Please fill in all required fields');
        return;
      }
      if (new Date(formData.startDate) >= new Date(formData.endDate)) {
        setError('End date must be after start date');
        return;
      }
    }
    
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const addDestination = () => {
    if (!newDestination.name || !newDestination.country || !newDestination.city) {
      setError('Please fill in all destination fields');
      return;
    }

    const destination: Destination = {
      id: Date.now().toString(),
      ...newDestination,
      startDate: newDestination.startDate || formData.startDate,
      endDate: newDestination.endDate || formData.endDate,
    };

    setDestinations(prev => [...prev, destination]);
    setNewDestination({
      name: '',
      country: '',
      city: '',
      startDate: '',
      endDate: '',
    });
    setError('');
  };

  const removeDestination = (id: string) => {
    setDestinations(prev => prev.filter(d => d.id !== id));
  };

  const addCollaborator = () => {
    if (!newCollaboratorEmail) {
      setError('Please enter an email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newCollaboratorEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    if (collaborators.includes(newCollaboratorEmail)) {
      setError('This collaborator has already been added');
      return;
    }

    setCollaborators(prev => [...prev, newCollaboratorEmail]);
    setNewCollaboratorEmail('');
    setError('');
  };

  const removeCollaborator = (email: string) => {
    setCollaborators(prev => prev.filter(c => c !== email));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await createVacation({
        ...formData,
        status: 'planning',
        destinations: destinations.map(dest => ({
          id: dest.id,
          name: dest.name,
          country: dest.country,
          city: dest.city,
          coordinates: { lat: 0, lng: 0 }, // Default coordinates
          activities: [],
          startDate: dest.startDate,
          endDate: dest.endDate,
        })),
        budget: {
          id: '',
          vacationId: '',
          totalBudget: 0,
          currency: 'USD',
          categories: [],
          expenses: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        collaborators,
        isPublic: false,
      });
      
      handleClose();
    } catch (err) {
      setError('Failed to create vacation. Please try again.');
    }
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-medium text-white mb-2">Basic Information</h3>
        <p className="text-white/60 text-sm">Let's start with the basics of your vacation</p>
      </div>

      <div className="form-element">
        <Input
          label="Vacation Title"
          icon={MapPin}
          value={formData.title}
          onChange={handleChange('title')}
          required
          placeholder="e.g., Summer Europe Trip 2024"
        />
      </div>

      <div className="form-element">
        <label className="block text-sm font-medium text-white/90 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={handleChange('description')}
          rows={4}
          className="glass-input block w-full rounded-xl px-4 py-3 text-sm placeholder-white/60 focus:ring-2 focus:ring-white/30 focus:outline-none resize-none"
          placeholder="Describe your vacation plans, goals, or special occasions..."
        />
      </div>

      <div className="form-element grid grid-cols-2 gap-4">
        <Input
          type="date"
          label="Start Date"
          icon={Calendar}
          value={formData.startDate}
          onChange={handleChange('startDate')}
          required
        />
        <Input
          type="date"
          label="End Date"
          icon={Calendar}
          value={formData.endDate}
          onChange={handleChange('endDate')}
          required
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-medium text-white mb-2">Destinations</h3>
        <p className="text-white/60 text-sm">Add the places you want to visit</p>
      </div>

      {/* Add New Destination */}
      <div className="glass-card p-6 rounded-xl">
        <h4 className="text-white font-medium mb-4 flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          Add Destination
        </h4>
        
        <div className="space-y-4">
          <Input
            label="Destination Name"
            value={newDestination.name}
            onChange={(e) => setNewDestination(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Paris City Center, Bali Beach Resort"
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Country"
              value={newDestination.country}
              onChange={(e) => setNewDestination(prev => ({ ...prev, country: e.target.value }))}
              placeholder="e.g., France"
            />
            <Input
              label="City"
              value={newDestination.city}
              onChange={(e) => setNewDestination(prev => ({ ...prev, city: e.target.value }))}
              placeholder="e.g., Paris"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="date"
              label="Arrival Date (Optional)"
              value={newDestination.startDate}
              onChange={(e) => setNewDestination(prev => ({ ...prev, startDate: e.target.value }))}
            />
            <Input
              type="date"
              label="Departure Date (Optional)"
              value={newDestination.endDate}
              onChange={(e) => setNewDestination(prev => ({ ...prev, endDate: e.target.value }))}
            />
          </div>
          
          <Button
            type="button"
            variant="glass"
            icon={Plus}
            onClick={addDestination}
            className="w-full"
          >
            Add Destination
          </Button>
        </div>
      </div>

      {/* Destinations List */}
      {destinations.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-white font-medium">Added Destinations ({destinations.length})</h4>
          {destinations.map((destination, index) => (
            <div key={destination.id} className="glass-card p-4 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h5 className="font-medium text-white">{destination.name}</h5>
                  <p className="text-sm text-white/60">{destination.city}, {destination.country}</p>
                  {destination.startDate && destination.endDate && (
                    <p className="text-xs text-white/50 mt-1">
                      {new Date(destination.startDate).toLocaleDateString()} - {new Date(destination.endDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  icon={Trash2}
                  onClick={() => removeDestination(destination.id)}
                  className="text-red-400 hover:text-red-300"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {destinations.length === 0 && (
        <div className="text-center py-8 glass-card rounded-xl">
          <MapPin className="h-12 w-12 text-white/40 mx-auto mb-4" />
          <p className="text-white/60">No destinations added yet</p>
          <p className="text-sm text-white/40 mt-2">Add your first destination above</p>
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-medium text-white mb-2">Collaborators</h3>
        <p className="text-white/60 text-sm">Invite friends and family to plan together</p>
      </div>

      {/* Add New Collaborator */}
      <div className="glass-card p-6 rounded-xl">
        <h4 className="text-white font-medium mb-4 flex items-center">
          <Users className="h-4 w-4 mr-2" />
          Invite Collaborator
        </h4>
        
        <div className="flex space-x-3">
          <div className="flex-1">
            <Input
              type="email"
              label="Email Address"
              value={newCollaboratorEmail}
              onChange={(e) => setNewCollaboratorEmail(e.target.value)}
              placeholder="friend@example.com"
              onKeyPress={(e) => e.key === 'Enter' && addCollaborator()}
            />
          </div>
          <div className="flex items-end">
            <Button
              type="button"
              variant="glass"
              icon={Plus}
              onClick={addCollaborator}
            >
              Add
            </Button>
          </div>
        </div>
      </div>

      {/* Collaborators List */}
      {collaborators.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-white font-medium">Invited Collaborators ({collaborators.length})</h4>
          {collaborators.map((email, index) => (
            <div key={email} className="glass-card p-4 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{email}</p>
                    <p className="text-sm text-white/60">Will receive invitation</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  icon={X}
                  onClick={() => removeCollaborator(email)}
                  className="text-red-400 hover:text-red-300"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {collaborators.length === 0 && (
        <div className="text-center py-8 glass-card rounded-xl">
          <Users className="h-12 w-12 text-white/40 mx-auto mb-4" />
          <p className="text-white/60">No collaborators added yet</p>
          <p className="text-sm text-white/40 mt-2">You can always add collaborators later</p>
        </div>
      )}
    </div>
  );

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'Basic Information';
      case 2: return 'Destinations';
      case 3: return 'Collaborators';
      default: return 'Create Vacation';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Create New Vacation - ${getStepTitle()}`} size="lg">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                step <= currentStep
                  ? 'bg-blue-500 border-blue-500 text-white'
                  : 'border-white/30 text-white/60'
              }`}
            >
              {step}
            </div>
          ))}
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(currentStep / 3) * 100}%` }}
          ></div>
        </div>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}

        {error && (
          <div className="form-element text-red-300 text-sm text-center glass-card p-3 rounded-xl border border-red-400/30">
            {error}
          </div>
        )}

        <div className="form-element flex space-x-3 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={currentStep === 1 ? handleClose : handlePrevStep}
            className="flex-1"
          >
            {currentStep === 1 ? 'Cancel' : 'Previous'}
          </Button>
          
          {currentStep < 3 ? (
            <Button
              type="button"
              onClick={handleNextStep}
              glow
              className="flex-1"
            >
              Next Step
            </Button>
          ) : (
            <Button
              type="submit"
              icon={Plus}
              loading={isLoading}
              glow
              className="flex-1"
            >
              Create Vacation
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
};