import React, { useState, useRef, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { ConfirmModal } from '../ui/ConfirmModal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { DatePicker } from '../ui/DatePicker';
import { AutocompleteInput } from '../ui/AutocompleteInput';
import { useVacationStore } from '../../stores/vacationStore';
import { Vacation } from '../../types';
import { countries, cities } from '../../data/locations';
import { Save, Calendar, MapPin, Users, Trash2, Plus } from 'lucide-react';
import { gsap } from 'gsap';

interface EditVacationModalProps {
  isOpen: boolean;
  onClose: () => void;
  vacation: Vacation;
}

export const EditVacationModal: React.FC<EditVacationModalProps> = ({
  isOpen,
  onClose,
  vacation,
}) => {
  const [formData, setFormData] = useState({
    title: vacation.title,
    description: vacation.description,
    startDate: vacation.startDate,
    endDate: vacation.endDate,
    status: vacation.status,
  });
  const [collaborators, setCollaborators] = useState<string[]>(vacation.collaborators);
  const [newCollaboratorEmail, setNewCollaboratorEmail] = useState('');
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const { updateVacation, deleteVacation, fetchVacations, isLoading } = useVacationStore();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      setError('End date must be after start date');
      return;
    }

    try {
      await updateVacation(vacation.id, {
        ...formData,
        collaborators,
      });
      onClose();
    } catch (err) {
      setError('Failed to update vacation. Please try again.');
    }
  };

  const handleDelete = async () => {
    console.log('🔄 [EditVacationModal] Delete confirmed for vacation:', vacation.id);
    
    try {
      console.log('🔄 [EditVacationModal] Calling deleteVacation...');
      await deleteVacation(vacation.id);
      console.log('✅ [EditVacationModal] Vacation deleted successfully');
      // Force a refresh of the vacations list
      await fetchVacations();
      onClose();
    } catch (err) {
      console.error('❌ [EditVacationModal] Delete failed:', err);
      setError(`Failed to delete vacation: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
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

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };
  
  // Date picker handlers
  const handleDateChange = (field: string) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Vacation" size="lg">
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        <div className="form-element">
          <Input
            label="Vacation Title"
            icon={MapPin}
            value={formData.title}
            onChange={handleChange('title')}
            required
            placeholder="Enter vacation title"
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
            placeholder="Describe your vacation plans..."
          />
        </div>

        <div className="form-element grid grid-cols-2 gap-4">
          <DatePicker
            label="Start Date"
            value={formData.startDate}
           onChange={handleDateChange('startDate')}
            required
          />
          <DatePicker
            label="End Date"
            value={formData.endDate}
           onChange={handleDateChange('endDate')}
            required
            min={formData.startDate}
          />
        </div>

        <div className="form-element">
          <label className="block text-sm font-medium text-white/90 mb-2">Status</label>
          <select
            value={formData.status}
            onChange={handleChange('status')}
            className="glass-select w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
          >
            <option value="planning">Planning</option>
            <option value="confirmed">Confirmed</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Collaborators Section */}
        <div className="form-element">
          <h4 className="text-white font-medium mb-4 flex items-center">
            <Users className="h-4 w-4 mr-2" />
            Collaborators
          </h4>
          
          <div className="flex space-x-3 mb-4">
            <div className="flex-1">
              <Input
                type="email"
                value={newCollaboratorEmail}
                onChange={(e) => setNewCollaboratorEmail(e.target.value)}
                placeholder="Add collaborator email"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCollaborator())}
              />
            </div>
            <Button
              type="button"
              variant="glass"
              icon={Plus}
              onClick={addCollaborator}
            >
              Add
            </Button>
          </div>

          {collaborators.length > 0 && (
            <div className="space-y-2">
              {collaborators.map((email) => (
                <div key={email} className="glass-card p-3 rounded-xl flex items-center justify-between">
                  <span className="text-white">{email}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    icon={Trash2}
                    onClick={() => removeCollaborator(email)}
                    className="text-red-400 hover:text-red-300"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="form-element text-red-300 text-sm text-center glass-card p-3 rounded-xl border border-red-400/30">
            {error}
          </div>
        )}

        <div className="form-element flex space-x-3 pt-4">
          <Button
            type="button"
            variant="danger"
            icon={Trash2}
            onClick={() => setShowDeleteConfirm(true)}
            className="flex-1"
          >
            Delete Vacation
          </Button>
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            type="submit"
            icon={Save}
            loading={isLoading}
            glow
            className="flex-1"
          >
            Save Changes
          </Button>
        </div>
      </form>
      
      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Vacation"
        message={`Are you sure you want to delete "${vacation.title}"? This action cannot be undone and will remove all associated tasks, documents, and budget information.`}
        confirmText="Delete Vacation"
        cancelText="Keep Vacation"
        type="danger"
      />
    </Modal>
  );
};