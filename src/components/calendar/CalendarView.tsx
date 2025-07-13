import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { ChevronLeft, ChevronRight, Calendar, Plus, Clock, MapPin, Users, Star, Filter } from 'lucide-react';
import { gsap } from 'gsap';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  type: 'task' | 'activity' | 'travel' | 'accommodation' | 'flight' | 'hotel';
  color: string;
  description?: string;
  location?: string;
  priority?: 'low' | 'medium' | 'high';
  status?: 'confirmed' | 'pending' | 'cancelled';
}

interface CalendarViewProps {
  events: CalendarEvent[];
  startDate: string;
  endDate: string;
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: string) => void;
  onAddEvent?: (date: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  events,
  startDate,
  endDate,
  onEventClick,
  onDateClick,
  onAddEvent,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(startDate));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'agenda'>('month');
  const [filterType, setFilterType] = useState<string>('all');
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (calendarRef.current) {
      const elements = calendarRef.current.querySelectorAll('.calendar-day, .event-item');
      gsap.fromTo(elements,
        { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.6, stagger: 0.02, ease: "back.out(1.7)" }
      );
    }
  }, [currentMonth, viewMode]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add days from previous month
    const prevMonth = new Date(year, month - 1, 0);
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonth.getDate() - i),
        isCurrentMonth: false,
        isPrevMonth: true,
      });
    }
    
    // Add days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        date: new Date(year, month, day),
        isCurrentMonth: true,
        isPrevMonth: false,
      });
    }
    
    // Add days from next month to complete the grid
    const remainingDays = 42 - days.length; // 6 rows × 7 days
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        date: new Date(year, month + 1, day),
        isCurrentMonth: false,
        isPrevMonth: false,
      });
    }
    
    return days;
  };

  const getEventsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return events.filter(event => {
      const matchesDate = event.date === dateString;
      const matchesFilter = filterType === 'all' || event.type === filterType;
      return matchesDate && matchesFilter;
    });
  };

  const isDateInRange = (date: Date) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return date >= start && date <= end;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    if (!selectedDate) return false;
    return date.toISOString().split('T')[0] === selectedDate;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const handleDateClick = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    setSelectedDate(dateString);
    onDateClick?.(dateString);
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'flight': return '✈️';
      case 'hotel': return '🏨';
      case 'activity': return '🎯';
      case 'task': return '✅';
      case 'travel': return '🚗';
      default: return '📍';
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'flight': return 'bg-blue-500';
      case 'hotel': return 'bg-green-500';
      case 'activity': return 'bg-purple-500';
      case 'task': return 'bg-orange-500';
      case 'travel': return 'bg-indigo-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-blue-500';
    }
  };

  const days = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const renderMonthView = () => (
    <div className="space-y-4">
      {/* Days of week header */}
      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-sm font-semibold text-white/80 py-3 bg-white/5 rounded-lg">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((dayInfo, index) => {
          const { date, isCurrentMonth } = dayInfo;
          const dayEvents = getEventsForDate(date);
          const inRange = isDateInRange(date);
          const today = isToday(date);
          const selected = isSelected(date);

          return (
            <div
              key={index}
              className={`calendar-day relative min-h-[120px] p-2 rounded-xl cursor-pointer transition-all duration-300 group ${
                !isCurrentMonth 
                  ? 'bg-white/5 text-white/40' 
                  : inRange 
                    ? selected
                      ? 'bg-blue-500/30 ring-2 ring-blue-400 shadow-lg'
                      : today
                        ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 ring-1 ring-blue-400/50'
                        : 'bg-white/10 hover:bg-white/15 hover:scale-[1.02]'
                    : 'bg-white/5 hover:bg-white/8'
              }`}
              onClick={() => handleDateClick(date)}
            >
              {/* Date number */}
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-semibold ${
                  !isCurrentMonth 
                    ? 'text-white/40' 
                    : today 
                      ? 'text-blue-300 font-bold' 
                      : selected
                        ? 'text-white font-bold'
                        : inRange 
                          ? 'text-white' 
                          : 'text-white/60'
                }`}>
                  {date.getDate()}
                </span>
                
                {/* Add event button */}
                {inRange && isCurrentMonth && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddEvent?.(date.toISOString().split('T')[0]);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full bg-blue-500/20 hover:bg-blue-500/40"
                  >
                    <Plus className="h-3 w-3 text-blue-300" />
                  </button>
                )}
              </div>
              
              {/* Events */}
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    className={`event-item text-xs p-1.5 rounded-md cursor-pointer transition-all hover:scale-105 border-l-2 ${getPriorityColor(event.priority)} ${getEventTypeColor(event.type)}/80 backdrop-blur-sm`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick?.(event);
                    }}
                  >
                    <div className="flex items-center space-x-1">
                      <span className="text-xs">{getEventTypeIcon(event.type)}</span>
                      <span className="text-white font-medium truncate flex-1">{event.title}</span>
                    </div>
                    {event.time && (
                      <div className="flex items-center space-x-1 mt-1">
                        <Clock className="h-2.5 w-2.5 text-white/70" />
                        <span className="text-white/70 text-xs">{event.time}</span>
                      </div>
                    )}
                  </div>
                ))}
                
                {dayEvents.length > 3 && (
                  <div className="text-xs text-center text-white/60 bg-white/10 rounded-md py-1">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderAgendaView = () => {
    const upcomingEvents = events
      .filter(event => {
        const eventDate = new Date(event.date);
        const today = new Date();
        const matchesFilter = filterType === 'all' || event.type === filterType;
        return eventDate >= today && matchesFilter;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 10);

    return (
      <div className="space-y-4">
        {upcomingEvents.length > 0 ? (
          upcomingEvents.map((event, index) => (
            <div
              key={event.id}
              className={`event-item glass-card p-4 rounded-xl hover:scale-[1.02] transition-all cursor-pointer border-l-4 ${getPriorityColor(event.priority)}`}
              onClick={() => onEventClick?.(event)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className={`w-10 h-10 ${getEventTypeColor(event.type)} rounded-xl flex items-center justify-center text-white text-lg`}>
                    {getEventTypeIcon(event.type)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-white mb-1">{event.title}</h4>
                    <div className="flex items-center space-x-4 text-sm text-white/70">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(event.date).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })}</span>
                      </div>
                      {event.time && (
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{event.time}</span>
                        </div>
                      )}
                      {event.location && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      )}
                    </div>
                    {event.description && (
                      <p className="text-white/60 text-sm mt-2">{event.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {event.status && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      event.status === 'confirmed' ? 'bg-green-500/20 text-green-300' :
                      event.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-red-500/20 text-red-300'
                    }`}>
                      {event.status}
                    </span>
                  )}
                  <Star className="h-4 w-4 text-yellow-400" />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16">
            <Calendar className="h-16 w-16 text-white/40 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No upcoming events</h3>
            <p className="text-white/60">Your schedule is clear!</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="overflow-hidden" glow>
      <CardHeader className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-white/10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Header Title and Navigation */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" icon={ChevronLeft} onClick={() => navigateMonth('prev')} />
              <h3 className="text-xl font-bold text-white min-w-[200px] text-center">
                {monthName}
              </h3>
              <Button variant="ghost" size="sm" icon={ChevronRight} onClick={() => navigateMonth('next')} />
            </div>
          </div>

          {/* View Mode and Filter Controls */}
          <div className="flex items-center space-x-3">
            {/* Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="glass-select rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="all">All Events</option>
              <option value="flight">✈️ Flights</option>
              <option value="hotel">🏨 Hotels</option>
              <option value="activity">🎯 Activities</option>
              <option value="task">✅ Tasks</option>
              <option value="travel">🚗 Travel</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex bg-white/10 rounded-xl p-1">
              {[
                { mode: 'month', label: 'Month', icon: Calendar },
                { mode: 'agenda', label: 'Agenda', icon: Users },
              ].map(({ mode, label, icon: Icon }) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode as any)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    viewMode === mode
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent ref={calendarRef} className="p-6">
        {viewMode === 'month' ? renderMonthView() : renderAgendaView()}
        
        {/* Legend */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <h4 className="text-white font-medium mb-4">Event Types</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { type: 'flight', label: 'Flights', icon: '✈️' },
              { type: 'hotel', label: 'Hotels', icon: '🏨' },
              { type: 'activity', label: 'Activities', icon: '🎯' },
              { type: 'task', label: 'Tasks', icon: '✅' },
              { type: 'travel', label: 'Travel', icon: '🚗' },
              { type: 'other', label: 'Other', icon: '📍' },
            ].map(({ type, label, icon }) => (
              <div key={type} className="flex items-center space-x-2 text-sm">
                <div className={`w-4 h-4 ${getEventTypeColor(type)} rounded-sm flex items-center justify-center`}>
                  <span className="text-xs">{icon}</span>
                </div>
                <span className="text-white/70">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};