import React, { useRef, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  CheckSquare, 
  DollarSign, 
  FileText, 
  Users,
  Settings,
  BarChart3
} from 'lucide-react';
import { gsap } from 'gsap';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Vacations', href: '/vacations', icon: Calendar },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Budget', href: '/budget', icon: DollarSign },
  { name: 'Documents', href: '/documents', icon: FileText },
  { name: 'Collaborators', href: '/collaborators', icon: Users },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sidebarRef.current) {
      const navItems = sidebarRef.current.querySelectorAll('.nav-item');
      
      gsap.fromTo(sidebarRef.current,
        { x: -300, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
      );

      gsap.fromTo(navItems,
        { x: -50, opacity: 0 },
        { 
          x: 0, 
          opacity: 1, 
          duration: 0.6, 
          stagger: 0.1, 
          delay: 0.3,
          ease: "power2.out" 
        }
      );
    }
  }, []);

  return (
    <div ref={sidebarRef} className="w-64 glass border-r border-white/10 min-h-screen">
      <nav className="p-4 space-y-2">
        {navigation.map((item, index) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`
                nav-item flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 group
                ${isActive 
                  ? 'glass-card text-white shadow-lg' 
                  : 'text-white/70 hover:text-white hover:bg-white/10'
                }
              `}
            >
              <item.icon className={`h-5 w-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-white' : ''}`} />
              <span>{item.name}</span>
              {isActive && (
                <div className="ml-auto w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full pulse-glow"></div>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};