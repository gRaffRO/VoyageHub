import React, { useRef, useEffect } from 'react';
import { LucideIcon } from 'lucide-react';
import { gsap } from 'gsap';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  loading?: boolean;
  fullWidth?: boolean;
  glow?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  loading = false,
  fullWidth = false,
  glow = false,
  className = '',
  disabled,
  ...props
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (buttonRef.current && !disabled && !loading && !glow) {
      const button = buttonRef.current;
      
      const handleMouseEnter = () => {
        gsap.to(button, {
          scale: 1.02,
          duration: 0.2,
          ease: "power2.out"
        });
      };

      const handleMouseLeave = () => {
        gsap.to(button, {
          scale: 1,
          duration: 0.2,
          ease: "power2.out"
        });
      };

      const handleMouseDown = () => {
        gsap.to(button, {
          scale: 0.98,
          duration: 0.1,
          ease: "power2.out"
        });
      };

      const handleMouseUp = () => {
        gsap.to(button, {
          scale: 1.02,
          duration: 0.1,
          ease: "power2.out"
        });
      };

      button.addEventListener('mouseenter', handleMouseEnter);
      button.addEventListener('mouseleave', handleMouseLeave);
      button.addEventListener('mousedown', handleMouseDown);
      button.addEventListener('mouseup', handleMouseUp);

      return () => {
        button.removeEventListener('mouseenter', handleMouseEnter);
        button.removeEventListener('mouseleave', handleMouseLeave);
        button.removeEventListener('mousedown', handleMouseDown);
        button.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [disabled, loading, glow]);

  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-500/80 to-purple-600/80 hover:from-blue-600/90 hover:to-purple-700/90 text-white backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl focus:ring-blue-500/50',
    secondary: 'glass-button text-white hover:text-white focus:ring-white/50',
    danger: 'bg-gradient-to-r from-red-500/80 to-pink-600/80 hover:from-red-600/90 hover:to-pink-700/90 text-white backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl focus:ring-red-500/50',
    ghost: 'text-white/80 hover:text-white hover:bg-white/10 focus:ring-white/50 backdrop-blur-sm',
    glass: 'glass-button text-white hover:text-white focus:ring-white/50',
  };
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm rounded-xl',
    md: 'px-6 py-3 text-sm rounded-xl',
    lg: 'px-8 py-4 text-base rounded-2xl',
  };

  const glowClass = glow ? 'pulse-glow' : '';

  const classes = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${fullWidth ? 'w-full' : ''}
    ${glowClass}
    ${className}
  `.trim();

  return (
    <button
      ref={buttonRef}
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {Icon && !loading && <Icon className="mr-2 h-4 w-4" />}
      {children}
      {variant === 'primary' && (
        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      )}
    </button>
  );
};