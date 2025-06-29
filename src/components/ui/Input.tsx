import React, { useRef, useEffect } from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';
import { gsap } from 'gsap';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: LucideIcon;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon: Icon,
  helperText,
  className = '',
  ...props
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (inputRef.current && containerRef.current) {
      const input = inputRef.current;
      const container = containerRef.current;
      
      const handleFocus = () => {
        gsap.to(container, {
          scale: 1.02,
          duration: 0.3,
          ease: "power2.out"
        });
      };

      const handleBlur = () => {
        gsap.to(container, {
          scale: 1,
          duration: 0.3,
          ease: "power2.out"
        });
      };

      input.addEventListener('focus', handleFocus);
      input.addEventListener('blur', handleBlur);

      return () => {
        input.removeEventListener('focus', handleFocus);
        input.removeEventListener('blur', handleBlur);
      };
    }
  }, []);

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-white/90">
          {label}
        </label>
      )}
      <div ref={containerRef} className="relative">
        {Icon && (
          <Icon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
        )}
        <input
          ref={inputRef}
          className={`
            glass-input block w-full rounded-xl px-4 py-3 text-sm
            placeholder-white/60 transition-all duration-300
            focus:ring-2 focus:ring-white/30 focus:outline-none
            disabled:bg-white/5 disabled:cursor-not-allowed
            ${Icon ? 'pl-12' : ''}
            ${error ? 'border-red-400/50 focus:border-red-400/70 focus:ring-red-400/30' : ''}
            ${className}
          `.trim()}
          {...props}
        />
      </div>
      {error && (
        <p className="text-sm text-red-300">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-sm text-white/60">{helperText}</p>
      )}
    </div>
  );
};