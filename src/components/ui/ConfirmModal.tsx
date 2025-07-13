import React, { useRef, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from './Button';
import { gsap } from 'gsap';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      
      if (modalRef.current && backdropRef.current) {
        gsap.fromTo(backdropRef.current, 
          { opacity: 0 },
          { opacity: 1, duration: 0.3, ease: "power2.out" }
        );
        
        gsap.fromTo(modalRef.current,
          { opacity: 0, scale: 0.8, y: 50 },
          { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: "back.out(1.7)" }
        );
      }
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleClose = () => {
    if (modalRef.current && backdropRef.current) {
      gsap.to(modalRef.current, {
        opacity: 0,
        scale: 0.8,
        y: 50,
        duration: 0.3,
        ease: "power2.in"
      });
      
      gsap.to(backdropRef.current, {
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
        onComplete: onClose
      });
    } else {
      onClose();
    }
  };

  const handleConfirm = () => {
    onConfirm();
    handleClose();
  };

  if (!isOpen) return null;

  const getIconColor = () => {
    switch (type) {
      case 'danger': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      default: return 'text-blue-400';
    }
  };

  const getConfirmButtonVariant = () => {
    switch (type) {
      case 'danger': return 'danger';
      case 'warning': return 'secondary';
      default: return 'primary';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        ref={backdropRef}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div 
        ref={modalRef}
        className="relative glass-card rounded-3xl p-6 w-full max-w-md"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-full bg-white/10 flex items-center justify-center ${getIconColor()}`}>
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-semibold text-white">{title}</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            icon={X}
            onClick={handleClose}
            className="text-white/60 hover:text-white"
          />
        </div>
        
        <p className="text-white/70 mb-8 leading-relaxed">{message}</p>
        
        <div className="flex space-x-3">
          <Button
            variant="ghost"
            onClick={handleClose}
            className="flex-1"
          >
            {cancelText}
          </Button>
          <Button
            variant={getConfirmButtonVariant()}
            onClick={handleConfirm}
            className="flex-1"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};