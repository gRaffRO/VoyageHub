import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { ChevronLeft, ChevronRight, Calendar, Plus, Clock, MapPin } from 'lucide-react';
import { gsap } from 'gsap';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  type: 'task' | 'activity' | 'travel' | 'accommodation';
  color: string;
  description?: string;
  location?: string;
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
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (calendarRef.current) {
      const elements = calendarRef.current.querySelectorAll('.calendar-day');
      gsap.fromTo(elements,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, stagger: 0.02, ease: "back.out(1.7)" }
      );
    }
  }, [currentMonth]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getEventsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateString);
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

  const days = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <Card glow>
      <CardHeader className="flex flex-row items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          {monthName}
        </h3>
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" icon={ChevronLeft} onClick={() => navigateMonth('prev')} />
          <Button variant="ghost" size="sm" icon={ChevronRight} onClick={() => navigateMonth('next')} />
        </div>
      </CardHeader>
      <CardContent ref={calendarRef}>
        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-white/60 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((date, index) => {
            if (!date) {
              return <div key={index} className="calendar-day h-24" />;
            }

            const dayEvents = getEventsForDate(date);
            const inRange = isDateInRange(date);
            const today = isToday(date);

            return (
              <div
                key={index}
                className={`calendar-day h-24 p-1 border border-white/10 rounded-lg cursor-pointer transition-all hover:bg-white/5 ${
                  inRange ? 'bg-blue-500/10' : 'bg-white/5'
                } ${today ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => {
                  onDateClick?.(date.toISOString().split('T')[0]);
                  if (inRange && onAddEvent) {
                    onAddEvent(date.toISOString().split('T')[0]);
                  }
                }}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-sm font-medium ${
                    inRange ? 'text-white' : 'text-white/40'
                  } ${today ? 'text-blue-300' : ''}`}>
                    {date.getDate()}
                  </span>
                  {inRange && dayEvents.length === 0 && (
                    <Plus className="h-3 w-3 text-white/40 hover:text-white/80" />
                  )}
                </div>
                
                <div className="space-y-1">
                  {dayEvents.slice(0, 2).map((event) => (
                    <div
                      key={event.id}
                      className={`text-xs p-1 rounded ${event.color} cursor-pointer hover:opacity-80`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick?.(event);
                      }}
                    >
                      <div className="flex items-center space-x-1">
                        {event.time && <Clock className="h-2 w-2" />}
                        <span className="truncate">{event.title}</span>
                      </div>
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-white/60 text-center">
                      +{dayEvents.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-4 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-white/70">Tasks</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-white/70">Activities</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-500 rounded"></div>
            <span className="text-white/70">Travel</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-500 rounded"></div>
            <span className="text-white/70">Accommodation</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};