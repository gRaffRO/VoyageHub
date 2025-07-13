import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, MapPin } from 'lucide-react';
import { gsap } from 'gsap';

interface AutocompleteInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  placeholder: string;
  icon?: React.ElementType;
  required?: boolean;
}

export const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  label,
  value,
  onChange,
  suggestions,
  placeholder,
  icon: Icon = MapPin,
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value) {
      const filtered = suggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSuggestions(filtered.slice(0, 10)); // Limit to 10 suggestions
    } else {
      setFilteredSuggestions(suggestions.slice(0, 10));
    }
  }, [value, suggestions]);

  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      gsap.fromTo(dropdownRef.current,
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.2, ease: "power2.out" }
      );
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setIsOpen(true);
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleInputBlur = () => {
    // Delay closing to allow suggestion clicks
    setTimeout(() => setIsOpen(false), 150);
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-white/90 mb-2">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      
      <div className="relative">
        <Icon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          required={required}
          className="glass-input block w-full rounded-xl pl-12 pr-10 py-3 text-sm placeholder-white/60 focus:ring-2 focus:ring-white/30 focus:outline-none"
        />
        <ChevronDown className={`absolute right-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && filteredSuggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 glass-card rounded-xl shadow-lg max-h-60 overflow-y-auto"
        >
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full text-left px-4 py-3 text-sm text-white hover:bg-white/10 transition-colors first:rounded-t-xl last:rounded-b-xl"
            >
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-white/60" />
                <span>{suggestion}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};