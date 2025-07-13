import React, { useRef, useEffect, useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useNotificationStore } from '../../stores/notificationStore';
import { Button } from '../ui/Button';
import { Bell, User, Settings, LogOut, Plane, Camera } from 'lucide-react';
import { gsap } from 'gsap';

export const Header: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { notifications, unreadCount, fetchNotifications, markAsRead } = useNotificationStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (headerRef.current) {
      gsap.fromTo(headerRef.current,
        { y: -100, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
      );
    }
  }, []);

  const handleNotificationClick = async (notification: any) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  return (
    <header ref={headerRef} className="glass sticky top-0 z-40 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Plane className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">
                VoyageHub
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <Button 
                variant="ghost" 
                size="sm" 
                icon={Bell} 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative"
              >
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white pulse-glow">
                    {unreadCount}
                  </span>
                )}
              </Button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 glass-card rounded-2xl shadow-lg z-50 max-h-96 overflow-y-auto">
                  <div className="p-4 border-b border-white/10">
                    <h3 className="text-lg font-semibold text-white">Notifications</h3>
                  </div>
                  <div className="p-2">
                    {notifications.length > 0 ? (
                      notifications.slice(0, 5).map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`p-3 rounded-xl cursor-pointer transition-colors hover:bg-white/10 ${
                            !notification.read ? 'bg-blue-500/10' : ''
                          }`}
                        >
                          <h4 className="font-medium text-white text-sm">{notification.title}</h4>
                          <p className="text-white/60 text-xs mt-1">{notification.message}</p>
                          <p className="text-white/40 text-xs mt-1">
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center">
                        <p className="text-white/60">No notifications</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <Button variant="ghost" size="sm" icon={Settings} />
            
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 glass-card px-4 py-2 rounded-xl hover:bg-white/10 transition-colors"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  {user?.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={`${user.firstName} ${user.lastName}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to icon if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <User className={`h-4 w-4 text-white ${user?.avatar ? 'hidden' : ''}`} />
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-white">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-white/60">{user?.email}</p>
                </div>
              </button>
              
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 glass-card rounded-2xl shadow-lg z-50">
                  <div className="p-4 border-b border-white/10">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center relative group cursor-pointer">
                        {user?.avatar ? (
                          <img 
                            src={user.avatar} 
                            alt={`${user?.firstName} ${user?.lastName}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="h-6 w-6 text-white" />
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Camera className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-white">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-sm text-white/60">{user?.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-2">
                    <button className="w-full flex items-center space-x-3 px-3 py-2 text-left text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors">
                      <Settings className="h-4 w-4" />
                      <span className="text-sm">Settings</span>
                    </button>
                    <button 
                      onClick={logout}
                      className="w-full flex items-center space-x-3 px-3 py-2 text-left text-red-300 hover:text-red-200 hover:bg-red-500/10 rounded-xl transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span className="text-sm">Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-white">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-white/60">{user?.email}</p>
              </div>
            </div>

          </div>
        </div>
      </div>
      
      {/* Click outside to close notifications */}
      {showNotifications && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowNotifications(false)}
        />
      )}
      
      {/* Click outside to close user menu */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  );
};