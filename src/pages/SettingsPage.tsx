import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../stores/authStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { User, Bell, Shield, Globe, Palette, Download, Trash2, Save, Camera, Upload } from 'lucide-react';
import { gsap } from 'gsap';

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const { user, updateProfile } = useAuthStore();
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    avatar: user?.avatar || '',
  });
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pageRef.current) {
      const elements = pageRef.current.querySelectorAll('.animate-element');
      gsap.fromTo(elements,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power3.out" }
      );
    }
  }, []);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // For demo purposes, we'll use a data URL
      // In production, you'd upload to a cloud service
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setProfileForm(prev => ({ ...prev, avatar: dataUrl }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSave = async () => {
    try {
      await updateProfile(profileForm);
      // Show success message
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: Globe },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  {profileForm.avatar ? (
                    <img 
                      src={profileForm.avatar} 
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-12 w-12 text-white" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-600 transition-colors">
                  <Camera className="h-4 w-4 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <div>
                <Button variant="glass" size="sm" icon={Upload}>Upload Photo</Button>
                <p className="text-sm text-white/60 mt-2">JPG, PNG up to 5MB</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input 
                label="First Name" 
                value={profileForm.firstName}
                onChange={(e) => setProfileForm(prev => ({ ...prev, firstName: e.target.value }))}
              />
              <Input 
                label="Last Name" 
                value={profileForm.lastName}
                onChange={(e) => setProfileForm(prev => ({ ...prev, lastName: e.target.value }))}
              />
              <Input label="Email" type="email" value={user?.email || ''} disabled />
              <Input label="Phone" type="tel" defaultValue="+1 (555) 123-4567" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">Bio</label>
              <textarea
                rows={4}
                className="glass-input block w-full rounded-xl px-4 py-3 text-sm placeholder-white/60 focus:ring-2 focus:ring-white/30 focus:outline-none resize-none"
                placeholder="Tell us about yourself..."
                defaultValue="Passionate traveler exploring the world one destination at a time."
              />
            </div>
            
            <Button icon={Save} glow onClick={handleProfileSave}>Save Changes</Button>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-white">Email Notifications</h4>
              <div className="space-y-3">
                {[
                  { label: 'Trip reminders', description: 'Get notified about upcoming trips' },
                  { label: 'Task updates', description: 'Notifications when tasks are completed' },
                  { label: 'Budget alerts', description: 'Alerts when approaching budget limits' },
                  { label: 'Collaboration invites', description: 'When someone invites you to a trip' },
                ].map((item, index) => (
                  <div key={index} className="glass-card p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">{item.label}</p>
                      <p className="text-sm text-white/60">{item.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-white">Push Notifications</h4>
              <div className="space-y-3">
                {[
                  { label: 'Real-time updates', description: 'Instant notifications for important updates' },
                  { label: 'Daily digest', description: 'Summary of daily activities' },
                ].map((item, index) => (
                  <div key={index} className="glass-card p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">{item.label}</p>
                      <p className="text-sm text-white/60">{item.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <Button icon={Save} glow>Save Preferences</Button>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-white">Account Security</h4>
              <div className="space-y-4">
                <Button variant="glass" className="w-full justify-start">
                  Change Password
                </Button>
                <Button variant="glass" className="w-full justify-start">
                  Enable Two-Factor Authentication
                </Button>
                <Button variant="glass" className="w-full justify-start">
                  View Login History
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-white">Privacy Settings</h4>
              <div className="space-y-3">
                {[
                  { label: 'Profile visibility', description: 'Make your profile visible to other users' },
                  { label: 'Trip sharing', description: 'Allow others to see your public trips' },
                  { label: 'Activity status', description: 'Show when you were last active' },
                ].map((item, index) => (
                  <div key={index} className="glass-card p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">{item.label}</p>
                      <p className="text-sm text-white/60">{item.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-white">Data Management</h4>
              <div className="space-y-3">
                <Button variant="glass" icon={Download} className="w-full justify-start">
                  Download My Data
                </Button>
                <Button variant="danger" icon={Trash2} className="w-full justify-start">
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        );

      case 'preferences':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">Default Currency</label>
                <select className="glass-select w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/30">
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="JPY">JPY - Japanese Yen</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">Timezone</label>
                <select className="glass-select w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/30">
                  <option value="UTC-8">Pacific Time (UTC-8)</option>
                  <option value="UTC-5">Eastern Time (UTC-5)</option>
                  <option value="UTC+0">GMT (UTC+0)</option>
                  <option value="UTC+9">Japan Time (UTC+9)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">Date Format</label>
                <select className="glass-select w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/30">
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">Language</label>
                <select className="glass-select w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/30">
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                  <option value="ja">日本語</option>
                </select>
              </div>
            </div>
            
            <Button icon={Save} glow>Save Preferences</Button>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-white">Theme</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { name: 'Dark', description: 'Dark theme with blue accents', active: true },
                  { name: 'Light', description: 'Light theme with clean design', active: false },
                  { name: 'Auto', description: 'Follows system preference', active: false },
                ].map((theme, index) => (
                  <div key={index} className={`glass-card p-4 rounded-xl cursor-pointer border-2 ${theme.active ? 'border-blue-500' : 'border-transparent'} hover:border-blue-400 transition-colors`}>
                    <div className="w-full h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mb-3"></div>
                    <h5 className="font-medium text-white">{theme.name}</h5>
                    <p className="text-sm text-white/60">{theme.description}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-white">Accent Color</h4>
              <div className="flex space-x-3">
                {[
                  'bg-blue-500',
                  'bg-purple-500',
                  'bg-green-500',
                  'bg-red-500',
                  'bg-yellow-500',
                  'bg-pink-500',
                ].map((color, index) => (
                  <button
                    key={index}
                    className={`w-10 h-10 ${color} rounded-full border-2 ${index === 0 ? 'border-white' : 'border-transparent'} hover:scale-110 transition-transform`}
                  />
                ))}
              </div>
            </div>
            
            <Button icon={Save} glow>Save Appearance</Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div ref={pageRef} className="space-y-8 p-8">
      {/* Header */}
      <div className="animate-element">
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-white/70">
          Manage your account preferences and application settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="animate-element lg:col-span-1">
          <Card>
            <CardContent className="p-0">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-500/20 text-blue-300 border-r-2 border-blue-500'
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <tab.icon className="h-5 w-5" />
                    <span className="text-sm font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        <div className="animate-element lg:col-span-3">
          <Card glow>
            <CardHeader>
              <h3 className="text-lg font-semibold text-white">
                {tabs.find(tab => tab.id === activeTab)?.label}
              </h3>
            </CardHeader>
            <CardContent>
              {renderTabContent()}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};