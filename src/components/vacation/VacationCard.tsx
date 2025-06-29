import React, { useRef, useEffect } from 'react';
import { Vacation } from '../../types';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Calendar, MapPin, Users, Settings, Star, Clock } from 'lucide-react';
import { gsap } from 'gsap';

interface VacationCardProps {
  vacation: Vacation;
  onEdit: (vacation: Vacation) => void;
  onView: (vacation: Vacation) => void;
}

export const VacationCard: React.FC<VacationCardProps> = ({
  vacation,
  onEdit,
  onView,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(cardRef.current,
        { y: 30, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.7)" }
      );
    }
  }, []);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30';
      case 'confirmed':
        return 'bg-blue-500/20 text-blue-300 border-blue-400/30';
      case 'active':
        return 'bg-green-500/20 text-green-300 border-green-400/30';
      case 'completed':
        return 'bg-gray-500/20 text-gray-300 border-gray-400/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-400/30';
    }
  };

  const getDaysUntil = () => {
    const today = new Date();
    const startDate = new Date(vacation.startDate);
    const diffTime = startDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
      return `${diffDays} days to go`;
    } else if (diffDays === 0) {
      return 'Today!';
    } else {
      return 'In progress';
    }
  };

  return (
    <div ref={cardRef}>
      <Card hover glow className="relative overflow-hidden group">
        {/* Gradient border effect */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
        
        {/* Background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50"></div>
        
        <CardContent className="p-6 relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-300 transition-colors">
                {vacation.title}
              </h3>
              <p className="text-sm text-white/60 line-clamp-2">
                {vacation.description}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(vacation.status)}`}>
                {vacation.status}
              </span>
              <Star className="h-4 w-4 text-yellow-400" />
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center text-sm text-white/70">
              <Calendar className="h-4 w-4 mr-3 text-blue-400" />
              <span>
                {formatDate(vacation.startDate)} - {formatDate(vacation.endDate)}
              </span>
            </div>
            
            <div className="flex items-center text-sm text-white/70">
              <MapPin className="h-4 w-4 mr-3 text-green-400" />
              <span>
                {vacation.destinations.length} destination{vacation.destinations.length !== 1 ? 's' : ''}
              </span>
            </div>
            
            <div className="flex items-center text-sm text-white/70">
              <Users className="h-4 w-4 mr-3 text-purple-400" />
              <span>
                {vacation.collaborators.length + 1} traveler{vacation.collaborators.length !== 0 ? 's' : ''}
              </span>
            </div>

            <div className="flex items-center text-sm text-white/70">
              <Clock className="h-4 w-4 mr-3 text-orange-400" />
              <span>{getDaysUntil()}</span>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              variant="primary"
              size="sm"
              onClick={() => onView(vacation)}
              className="flex-1"
              glow
            >
              View Details
            </Button>
            <Button
              variant="glass"
              size="sm"
              icon={Settings}
              onClick={() => onEdit(vacation)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};