import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, ArrowRight, ChevronDown } from 'lucide-react';
import { gsap } from 'gsap';

interface DateRange {
  startDate: string;
  endDate: string;
}

interface DateRangePickerProps {
  label?: string;
  value: DateRange;
  onChange: (range: DateRange) => void;
  placeholder?: string;
  required?: boolean;
  min?: string;
  max?: string;
  className?: string;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  label,
  value,
  onChange,
  placeholder = 'Select date range',
  required = false,
  min,
  max,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (value.startDate) {
      return new Date(value.startDate);
    }
    return new Date();
  });
  const [selectingEnd, setSelectingEnd] = useState(false);
  const [hoverDate, setHoverDate] = useState<string | null>(null);
  const [showYearPicker, setShowYearPicker] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      gsap.fromTo(dropdownRef.current,
        { opacity: 0, y: -10, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: "back.out(1.7)" }
      );
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectingEnd(false);
        setShowYearPicker(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

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
      });
    }
    
    // Add days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        date: new Date(year, month, day),
        isCurrentMonth: true,
      });
    }
    
    // Add days from next month to complete the grid
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        date: new Date(year, month + 1, day),
        isCurrentMonth: false,
      });
    }
    
    return days;
  };

  const isDateDisabled = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    if (min && dateString < min) return true;
    if (max && dateString > max) return true;
    return false;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isInRange = (date: Date) => {
    if (!value.startDate || !value.endDate) return false;
    const dateString = date.toISOString().split('T')[0];
    return dateString >= value.startDate && dateString <= value.endDate;
  };

  const isRangeStart = (date: Date) => {
    if (!value.startDate) return false;
    return date.toISOString().split('T')[0] === value.startDate;
  };

  const isRangeEnd = (date: Date) => {
    if (!value.endDate) return false;
    return date.toISOString().split('T')[0] === value.endDate;
  };

  const isInHoverRange = (date: Date) => {
    if (!value.startDate || !hoverDate || value.endDate) return false;
    const dateString = date.toISOString().split('T')[0];
    const start = value.startDate;
    const end = hoverDate;
    
    if (start <= end) {
      return dateString >= start && dateString <= end;
    } else {
      return dateString >= end && dateString <= start;
    }
  };

  const handleDateClick = (date: Date) => {
    if (isDateDisabled(date)) return;
    
    const dateString = date.toISOString().split('T')[0];
    
    if (!value.startDate || (value.startDate && value.endDate)) {
      // Start new selection
      onChange({ startDate: dateString, endDate: '' });
      setSelectingEnd(true);
    } else {
      // Complete the range
      if (dateString >= value.startDate) {
        onChange({ startDate: value.startDate, endDate: dateString });
      } else {
        onChange({ startDate: dateString, endDate: value.startDate });
      }
      setSelectingEnd(false);
      setIsOpen(false);
    }
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

  const handleYearChange = (year: number) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setFullYear(year);
      return newDate;
    });
    setShowYearPicker(false);
  };

  const formatDisplayRange = (range: DateRange) => {
    if (!range.startDate) return '';
    
    const startDate = new Date(range.startDate);
    const startFormatted = startDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
    
    if (!range.endDate) {
      return `${startFormatted} - Select end date`;
    }
    
    const endDate = new Date(range.endDate);
    const endFormatted = endDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: startDate.getFullYear() !== endDate.getFullYear() ? 'numeric' : undefined
    });
    
    return `${startFormatted} - ${endFormatted}`;
  };

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear - 50; year <= currentYear + 10; year++) {
      years.push(year);
    }
    return years;
  };

  const days = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long' });
  const currentYear = currentMonth.getFullYear();

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-white/90 mb-2">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      
      <div
        ref={inputRef}
        onClick={() => setIsOpen(!isOpen)}
        className="relative cursor-pointer"
      >
        <div className="glass-input block w-full rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-white/30 focus:outline-none transition-all duration-300 hover:bg-white/15">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Calendar className="h-4 w-4 text-white/60" />
              <span className={value.startDate ? 'text-white' : 'text-white/60'}>
                {value.startDate ? formatDisplayRange(value) : placeholder}
              </span>
            </div>
            <ArrowRight className="h-4 w-4 text-white/60" />
          </div>
        </div>
      </div>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9998]" />
          
          {/* Date Range Picker */}
          <div
            ref={dropdownRef}
            className="fixed z-[9999] mt-2 w-80 glass-card rounded-2xl shadow-2xl border border-white/20 overflow-hidden"
            style={{
              top: inputRef.current ? inputRef.current.getBoundingClientRect().bottom + 8 : '50%',
              left: inputRef.current ? Math.max(16, Math.min(
                inputRef.current.getBoundingClientRect().left,
                window.innerWidth - 320 - 16
              )) : '50%',
              transform: !inputRef.current ? 'translate(-50%, -50%)' : 'none'
            }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600/30 to-purple-600/30 p-4 border-b border-white/10 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-2">
                <button
                  type="button"
                  onClick={() => navigateMonth('prev')}
                  className="p-2 rounded-xl hover:bg-white/10 transition-colors text-white hover:text-blue-300"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-semibold text-white">{monthName}</h3>
                  <button
                    type="button"
                    onClick={() => setShowYearPicker(!showYearPicker)}
                    className="flex items-center space-x-1 px-3 py-1 rounded-lg hover:bg-white/10 transition-colors text-white hover:text-blue-300"
                  >
                    <span className="font-semibold">{currentYear}</span>
                    <ChevronDown className={`h-3 w-3 transition-transform ${showYearPicker ? 'rotate-180' : ''}`} />
                  </button>
                </div>
                
                <button
                  type="button"
                  onClick={() => navigateMonth('next')}
                  className="p-2 rounded-xl hover:bg-white/10 transition-colors text-white hover:text-blue-300"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              
              {selectingEnd && (
                <p className="text-sm text-blue-300 text-center">Select end date</p>
              )}
              
              {/* Year Picker */}
              {showYearPicker && (
                <div className="absolute top-full left-0 right-0 bg-black/90 backdrop-blur-md border border-white/20 rounded-xl mt-1 max-h-48 overflow-y-auto z-10">
                  <div className="grid grid-cols-4 gap-1 p-2">
                    {generateYearOptions().map((year) => (
                      <button
                        key={year}
                        type="button"
                        onClick={() => handleYearChange(year)}
                        className={`p-2 text-sm rounded-lg transition-colors ${
                          year === currentYear
                            ? 'bg-blue-500 text-white'
                            : 'text-white/70 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Days of week */}
            <div className="grid grid-cols-7 gap-1 p-4 pb-2 bg-white/5">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                <div key={day} className="text-center text-xs font-semibold text-white/60 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1 p-4 pt-0 bg-white/5">
              {days.map((dayInfo, index) => {
                const { date, isCurrentMonth } = dayInfo;
                const disabled = isDateDisabled(date);
                const today = isToday(date);
                const inRange = isInRange(date);
                const rangeStart = isRangeStart(date);
                const rangeEnd = isRangeEnd(date);
                const inHoverRange = isInHoverRange(date);

                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleDateClick(date)}
                    onMouseEnter={() => setHoverDate(date.toISOString().split('T')[0])}
                    onMouseLeave={() => setHoverDate(null)}
                    disabled={disabled}
                    className={`
                      relative h-10 w-10 rounded-xl text-sm font-medium transition-all duration-200 z-10
                      ${!isCurrentMonth 
                        ? 'text-white/30 hover:text-white/50' 
                        : disabled
                          ? 'text-white/30 cursor-not-allowed'
                          : rangeStart || rangeEnd
                            ? 'bg-blue-500 text-white shadow-lg scale-105 ring-2 ring-blue-400/50'
                            : inRange
                              ? 'bg-blue-500/30 text-white'
                              : inHoverRange
                                ? 'bg-blue-500/20 text-white'
                                : today
                                  ? 'bg-gradient-to-br from-blue-500/30 to-purple-500/30 text-white ring-1 ring-blue-400/50'
                                  : 'text-white hover:bg-white/10 hover:scale-105'
                      }
                    `}
                  >
                    {date.getDate()}
                    {today && !inRange && (
                      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-400 rounded-full"></div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10 bg-white/5 backdrop-blur-sm">
              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => {
                    onChange({ startDate: '', endDate: '' });
                    setSelectingEnd(false);
                    setIsOpen(false);
                  }}
                  className="text-sm text-white/60 hover:text-white transition-colors font-medium"
                >
                  Clear
                </button>
                <div className="text-xs text-white/50">
                  {value.startDate && value.endDate && (
                    <>
                      {Math.ceil((new Date(value.endDate).getTime() - new Date(value.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};