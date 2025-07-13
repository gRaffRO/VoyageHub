import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { useNotificationStore } from '../../stores/notificationStore';
import { 
  Bell, 
  BellRing, 
  Check, 
  CheckCheck, 
  Trash2, 
  Filter, 
  Search,
  Calendar,
  DollarSign,
  Users,
  FileText,
  Settings,
  Plus
} from 'lucide-react';
import { gsap } from 'gsap';

interface CustomAlert {
  id: string;
  title: string;
  message: string;
  type: 'reminder' | 'deadline' | 'budget' | 'custom';
  triggerDate: string;
  triggerTime: string;
  repeat: 'none' | 'daily' | 'weekly' | 'monthly';
  vacationId?: string;
  isActive: boolean;
}

export const NotificationCenter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCustomAlertModalOpen, setIsCustomAlertModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [customAlerts, setCustomAlerts] = useState<CustomAlert[]>([]);
  const [alertForm, setAlertForm] = useState({
    title: '',
    message: '',
    type: 'reminder' as const,
    triggerDate: '',
    triggerTime: '',
    repeat: 'none' as const,
    vacationId: '',
  });

  const { 
    notifications, 
    unreadCount, 
    fetchNotifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotificationStore();

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (isOpen && containerRef.current) {
      const elements = containerRef.current.querySelectorAll('.notification-item');
      gsap.fromTo(elements,
        { x: 20, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.4, stagger: 0.05, ease: "power2.out" }
      );
    }
  }, [isOpen, notifications]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'reminder':
        return <Bell className="h-4 w-4 text-blue-400" />;
      case 'collaboration':
        return <Users className="h-4 w-4 text-purple-400" />;
      case 'budget':
        return <DollarSign className="h-4 w-4 text-yellow-400" />;
      case 'document':
        return <FileText className="h-4 w-4 text-green-400" />;
      case 'system':
        return <Settings className="h-4 w-4 text-gray-400" />;
      default:
        return <Bell className="h-4 w-4 text-blue-400" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'reminder':
        return 'border-blue-400/30 bg-blue-500/10';
      case 'collaboration':
        return 'border-purple-400/30 bg-purple-500/10';
      case 'budget':
        return 'border-yellow-400/30 bg-yellow-500/10';
      case 'document':
        return 'border-green-400/30 bg-green-500/10';
      case 'system':
        return 'border-gray-400/30 bg-gray-500/10';
      default:
        return 'border-blue-400/30 bg-blue-500/10';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || notification.type === filterType;
    
    return matchesSearch && matchesType;
  });

  const handleCreateCustomAlert = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newAlert: CustomAlert = {
      id: Date.now().toString(),
      ...alertForm,
      isActive: true,
    };
    
    setCustomAlerts(prev => [...prev, newAlert]);
    setAlertForm({
      title: '',
      message: '',
      type: 'reminder',
      triggerDate: '',
      triggerTime: '',
      repeat: 'none',
      vacationId: '',
    });
    setIsCustomAlertModalOpen(false);
  };

  const toggleAlert = (alertId: string) => {
    setCustomAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, isActive: !alert.isActive } : alert
    ));
  };

  const deleteAlert = (alertId: string) => {
    setCustomAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  return (
    <>
      {/* Notification Bell Button */}
      <div className="relative">
        <Button 
          variant="ghost" 
          size="sm" 
          icon={unreadCount > 0 ? BellRing : Bell}
          onClick={() => setIsOpen(true)}
          className="relative"
        >
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white pulse-glow">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </div>

      {/* Notification Center Modal */}
      <Modal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        title="Notification Center" 
        size="lg"
      >
        <div ref={containerRef} className="space-y-6">
          {/* Header Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <Input
                  placeholder="Search notifications..."
                  icon={Search}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="glass-select rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                <option value="all">All Types</option>
                <option value="reminder">Reminders</option>
                <option value="collaboration">Collaboration</option>
                <option value="budget">Budget</option>
                <option value="document">Documents</option>
                <option value="system">System</option>
              </select>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="glass" 
                size="sm" 
                icon={Plus}
                onClick={() => setIsCustomAlertModalOpen(true)}
              >
                Custom Alert
              </Button>
              {unreadCount > 0 && (
                <Button 
                  variant="glass" 
                  size="sm" 
                  icon={CheckCheck}
                  onClick={markAllAsRead}
                >
                  Mark All Read
                </Button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item glass-card p-4 rounded-xl border transition-all hover:bg-white/5 ${
                    !notification.read ? getNotificationColor(notification.type) : 'border-white/10'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className={`font-medium ${notification.read ? 'text-white/70' : 'text-white'}`}>
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                        <p className={`text-sm ${notification.read ? 'text-white/50' : 'text-white/70'}`}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-white/40 mt-2">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      {!notification.read && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          icon={Check}
                          onClick={() => markAsRead(notification.id)}
                          title="Mark as read"
                        />
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        icon={Trash2}
                        onClick={() => deleteNotification(notification.id)}
                        className="text-red-400 hover:text-red-300"
                        title="Delete notification"
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Bell className="h-16 w-16 text-white/40 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No notifications</h3>
                <p className="text-white/60">
                  {searchTerm || filterType !== 'all' 
                    ? 'No notifications match your search criteria'
                    : 'You\'re all caught up!'
                  }
                </p>
              </div>
            )}
          </div>

          {/* Custom Alerts Section */}
          {customAlerts.length > 0 && (
            <div className="border-t border-white/10 pt-6">
              <h4 className="text-white font-medium mb-4">Custom Alerts</h4>
              <div className="space-y-3">
                {customAlerts.map((alert) => (
                  <div key={alert.id} className="glass-card p-4 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-4 w-4 text-blue-400" />
                        <div>
                          <h5 className="font-medium text-white">{alert.title}</h5>
                          <p className="text-sm text-white/60">{alert.message}</p>
                          <p className="text-xs text-white/40">
                            {new Date(alert.triggerDate).toLocaleDateString()} at {alert.triggerTime}
                            {alert.repeat !== 'none' && ` • Repeats ${alert.repeat}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={alert.isActive}
                            onChange={() => toggleAlert(alert.id)}
                          />
                          <div className="w-9 h-5 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          icon={Trash2}
                          onClick={() => deleteAlert(alert.id)}
                          className="text-red-400 hover:text-red-300"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Custom Alert Modal */}
      <Modal 
        isOpen={isCustomAlertModalOpen} 
        onClose={() => setIsCustomAlertModalOpen(false)} 
        title="Create Custom Alert"
      >
        <form onSubmit={handleCreateCustomAlert} className="space-y-6">
          <Input
            label="Alert Title"
            value={alertForm.title}
            onChange={(e) => setAlertForm(prev => ({ ...prev, title: e.target.value }))}
            required
            placeholder="e.g., Check passport expiration"
          />
          
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">Message</label>
            <textarea
              value={alertForm.message}
              onChange={(e) => setAlertForm(prev => ({ ...prev, message: e.target.value }))}
              rows={3}
              className="glass-input block w-full rounded-xl px-4 py-3 text-sm placeholder-white/60 focus:ring-2 focus:ring-white/30 focus:outline-none resize-none"
              placeholder="Detailed alert message..."
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">Alert Type</label>
              <select
                value={alertForm.type}
                onChange={(e) => setAlertForm(prev => ({ ...prev, type: e.target.value as any }))}
                className="glass-select w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                <option value="reminder">Reminder</option>
                <option value="deadline">Deadline</option>
                <option value="budget">Budget Check</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">Repeat</label>
              <select
                value={alertForm.repeat}
                onChange={(e) => setAlertForm(prev => ({ ...prev, repeat: e.target.value as any }))}
                className="glass-select w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                <option value="none">No Repeat</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="date"
              label="Trigger Date"
              value={alertForm.triggerDate}
              onChange={(e) => setAlertForm(prev => ({ ...prev, triggerDate: e.target.value }))}
              required
            />
            <Input
              type="time"
              label="Trigger Time"
              value={alertForm.triggerTime}
              onChange={(e) => setAlertForm(prev => ({ ...prev, triggerTime: e.target.value }))}
              required
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => setIsCustomAlertModalOpen(false)} 
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" icon={Plus} glow className="flex-1">
              Create Alert
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};