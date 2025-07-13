import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Plus, MapPin, Clock, DollarSign, Calendar, Edit, Trash2, Star } from 'lucide-react';
import { gsap } from 'gsap';

interface Activity {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  duration: number;
  cost: number;
  currency: string;
  category: 'food' | 'entertainment' | 'transport' | 'shopping' | 'sightseeing' | 'other';
  location?: string;
  bookingRequired: boolean;
  confirmationNumber?: string;
  rating?: number;
  notes?: string;
}

interface ActivityManagerProps {
  vacationId: string;
  activities: Activity[];
  onActivityCreate: (activity: Partial<Activity>) => void;
  onActivityUpdate: (id: string, activity: Partial<Activity>) => void;
  onActivityDelete: (id: string) => void;
}

export const ActivityManager: React.FC<ActivityManagerProps> = ({
  vacationId,
  activities,
  onActivityCreate,
  onActivityUpdate,
  onActivityDelete,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [activityForm, setActivityForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: 60,
    cost: 0,
    currency: 'USD',
    category: 'sightseeing' as const,
    location: '',
    bookingRequired: false,
    confirmationNumber: '',
    notes: '',
  });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const elements = containerRef.current.querySelectorAll('.activity-card');
      gsap.fromTo(elements,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power2.out" }
      );
    }
  }, [activities]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'food': return '🍽️';
      case 'entertainment': return '🎭';
      case 'transport': return '🚗';
      case 'shopping': return '🛍️';
      case 'sightseeing': return '🏛️';
      default: return '📍';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'food': return 'bg-orange-500/20 text-orange-300 border-orange-400/30';
      case 'entertainment': return 'bg-purple-500/20 text-purple-300 border-purple-400/30';
      case 'transport': return 'bg-blue-500/20 text-blue-300 border-blue-400/30';
      case 'shopping': return 'bg-pink-500/20 text-pink-300 border-pink-400/30';
      case 'sightseeing': return 'bg-green-500/20 text-green-300 border-green-400/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-400/30';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingActivity) {
      onActivityUpdate(editingActivity.id, activityForm);
    } else {
      onActivityCreate(activityForm);
    }
    
    resetForm();
  };

  const resetForm = () => {
    setActivityForm({
      title: '',
      description: '',
      date: '',
      time: '',
      duration: 60,
      cost: 0,
      currency: 'USD',
      category: 'sightseeing',
      location: '',
      bookingRequired: false,
      confirmationNumber: '',
      notes: '',
    });
    setEditingActivity(null);
    setIsModalOpen(false);
  };

  const handleEdit = (activity: Activity) => {
    setEditingActivity(activity);
    setActivityForm({
      title: activity.title,
      description: activity.description,
      date: activity.date,
      time: activity.time,
      duration: activity.duration,
      cost: activity.cost,
      currency: activity.currency,
      category: activity.category,
      location: activity.location || '',
      bookingRequired: activity.bookingRequired,
      confirmationNumber: activity.confirmationNumber || '',
      notes: activity.notes || '',
    });
    setIsModalOpen(true);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${mins}m`;
  };

  const groupedActivities = activities.reduce((groups, activity) => {
    const date = activity.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(activity);
    return groups;
  }, {} as Record<string, Activity[]>);

  return (
    <div ref={containerRef} className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">Activities & Itinerary</h3>
        <Button icon={Plus} onClick={() => setIsModalOpen(true)} glow>
          Add Activity
        </Button>
      </div>

      {Object.keys(groupedActivities).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedActivities)
            .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
            .map(([date, dayActivities]) => (
              <div key={date} className="space-y-4">
                <h4 className="text-white font-medium flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  {new Date(date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h4>
                
                <div className="space-y-3">
                  {dayActivities
                    .sort((a, b) => a.time.localeCompare(b.time))
                    .map((activity) => (
                      <Card key={activity.id} className="activity-card group">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4 flex-1">
                              <div className="text-2xl">{getCategoryIcon(activity.category)}</div>
                              
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <h5 className="font-semibold text-white group-hover:text-blue-300 transition-colors">
                                    {activity.title}
                                  </h5>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(activity.category)}`}>
                                    {activity.category}
                                  </span>
                                  {activity.bookingRequired && (
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-300 border border-yellow-400/30">
                                      Booking Required
                                    </span>
                                  )}
                                </div>
                                
                                <p className="text-white/60 text-sm mb-3">{activity.description}</p>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                  <div className="flex items-center space-x-2 text-white/70">
                                    <Clock className="h-4 w-4" />
                                    <span>{activity.time} ({formatDuration(activity.duration)})</span>
                                  </div>
                                  
                                  {activity.location && (
                                    <div className="flex items-center space-x-2 text-white/70">
                                      <MapPin className="h-4 w-4" />
                                      <span className="truncate">{activity.location}</span>
                                    </div>
                                  )}
                                  
                                  {activity.cost > 0 && (
                                    <div className="flex items-center space-x-2 text-white/70">
                                      <DollarSign className="h-4 w-4" />
                                      <span>{activity.currency} {activity.cost}</span>
                                    </div>
                                  )}
                                  
                                  {activity.confirmationNumber && (
                                    <div className="flex items-center space-x-2 text-white/70">
                                      <span className="text-xs">#{activity.confirmationNumber}</span>
                                    </div>
                                  )}
                                </div>
                                
                                {activity.notes && (
                                  <div className="mt-3 p-3 glass-card rounded-lg">
                                    <p className="text-sm text-white/70">{activity.notes}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                icon={Edit}
                                onClick={() => handleEdit(activity)}
                              />
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                icon={Trash2}
                                onClick={() => onActivityDelete(activity.id)}
                                className="text-red-400 hover:text-red-300"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto glass-card p-8 rounded-3xl">
            <div className="text-6xl mb-4">🗓️</div>
            <h3 className="text-xl font-medium text-white mb-2">No activities planned yet</h3>
            <p className="text-white/60 mb-6">
              Start building your itinerary by adding activities, tours, and experiences
            </p>
            <Button icon={Plus} onClick={() => setIsModalOpen(true)} glow>
              Plan Your First Activity
            </Button>
          </div>
        </div>
      )}

      {/* Activity Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={resetForm} 
        title={editingActivity ? 'Edit Activity' : 'Add New Activity'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Activity Title"
            value={activityForm.title}
            onChange={(e) => setActivityForm(prev => ({ ...prev, title: e.target.value }))}
            required
            placeholder="e.g., Visit Eiffel Tower"
          />
          
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">Description</label>
            <textarea
              value={activityForm.description}
              onChange={(e) => setActivityForm(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="glass-input block w-full rounded-xl px-4 py-3 text-sm placeholder-white/60 focus:ring-2 focus:ring-white/30 focus:outline-none resize-none"
              placeholder="Describe the activity..."
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="date"
              label="Date"
              value={activityForm.date}
              onChange={(e) => setActivityForm(prev => ({ ...prev, date: e.target.value }))}
              required
            />
            <Input
              type="time"
              label="Time"
              value={activityForm.time}
              onChange={(e) => setActivityForm(prev => ({ ...prev, time: e.target.value }))}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">Category</label>
              <select
                value={activityForm.category}
                onChange={(e) => setActivityForm(prev => ({ ...prev, category: e.target.value as any }))}
                className="glass-select w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                <option value="sightseeing">🏛️ Sightseeing</option>
                <option value="food">🍽️ Food & Dining</option>
                <option value="entertainment">🎭 Entertainment</option>
                <option value="shopping">🛍️ Shopping</option>
                <option value="transport">🚗 Transportation</option>
                <option value="other">📍 Other</option>
              </select>
            </div>
            <Input
              type="number"
              label="Duration (minutes)"
              value={activityForm.duration}
              onChange={(e) => setActivityForm(prev => ({ ...prev, duration: Number(e.target.value) }))}
              min="15"
              step="15"
            />
          </div>
          
          <Input
            label="Location (Optional)"
            value={activityForm.location}
            onChange={(e) => setActivityForm(prev => ({ ...prev, location: e.target.value }))}
            placeholder="e.g., Champ de Mars, Paris"
            icon={MapPin}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              label="Cost"
              value={activityForm.cost}
              onChange={(e) => setActivityForm(prev => ({ ...prev, cost: Number(e.target.value) }))}
              min="0"
              step="0.01"
              icon={DollarSign}
            />
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">Currency</label>
              <select
                value={activityForm.currency}
                onChange={(e) => setActivityForm(prev => ({ ...prev, currency: e.target.value }))}
                className="glass-select w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="JPY">JPY</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="bookingRequired"
              checked={activityForm.bookingRequired}
              onChange={(e) => setActivityForm(prev => ({ ...prev, bookingRequired: e.target.checked }))}
              className="rounded border-white/30 bg-white/10 text-blue-500 focus:ring-blue-500"
            />
            <label htmlFor="bookingRequired" className="text-white">
              Booking required in advance
            </label>
          </div>
          
          {activityForm.bookingRequired && (
            <Input
              label="Confirmation Number"
              value={activityForm.confirmationNumber}
              onChange={(e) => setActivityForm(prev => ({ ...prev, confirmationNumber: e.target.value }))}
              placeholder="e.g., ABC123456"
            />
          )}
          
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">Notes (Optional)</label>
            <textarea
              value={activityForm.notes}
              onChange={(e) => setActivityForm(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="glass-input block w-full rounded-xl px-4 py-3 text-sm placeholder-white/60 focus:ring-2 focus:ring-white/30 focus:outline-none resize-none"
              placeholder="Additional notes, tips, or reminders..."
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="ghost" onClick={resetForm} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" icon={Plus} glow className="flex-1">
              {editingActivity ? 'Update Activity' : 'Add Activity'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};