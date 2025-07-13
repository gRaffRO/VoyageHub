import React, { useEffect, useRef } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { gsap } from 'gsap';

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose,
}) => {
  const toastRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (toastRef.current) {
      // Entrance animation
      gsap.fromTo(toastRef.current,
        { x: 400, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.4, ease: "back.out(1.7)" }
      );
    }

    // Auto-close timer
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    if (toastRef.current) {
      gsap.to(toastRef.current, {
        x: 400,
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => onClose(id)
      });
    } else {
      onClose(id);
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
      default:
        return <Info className="h-5 w-5 text-blue-400" />;
    }
  };

  const getColorClasses = () => {
    switch (type) {
      case 'success':
        return 'border-green-400/30 bg-green-500/10';
      case 'error':
        return 'border-red-400/30 bg-red-500/10';
      case 'warning':
        return 'border-yellow-400/30 bg-yellow-500/10';
      default:
        return 'border-blue-400/30 bg-blue-500/10';
    }
  };

  return (
    <div
      ref={toastRef}
      className={`glass-card rounded-xl p-4 border ${getColorClasses()} shadow-lg max-w-sm w-full`}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-white">{title}</h4>
          {message && (
            <p className="text-sm text-white/70 mt-1">{message}</p>
          )}
        </div>
        <button
          onClick={handleClose}
          className="flex-shrink-0 text-white/60 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};