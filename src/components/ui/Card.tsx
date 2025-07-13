import React, { useRef, useEffect } from 'react';
import { forwardRef } from 'react';
import { gsap } from 'gsap';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  glow = false,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cardRef.current && hover && !glow) {
      const card = cardRef.current;
      
      const handleMouseEnter = () => {
        gsap.to(card, {
          y: -4,
          scale: 1.01,
          duration: 0.3,
          ease: "power2.out"
        });
      };

      const handleMouseLeave = () => {
        gsap.to(card, {
          y: 0,
          scale: 1,
          duration: 0.3,
          ease: "power2.out"
        });
      };

      card.addEventListener('mouseenter', handleMouseEnter);
      card.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        card.removeEventListener('mouseenter', handleMouseEnter);
        card.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
  }, [hover, glow]);

  return (
    <div
      ref={cardRef}
      className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg shadow-lg transition-all duration-300 ${
        glow ? 'shadow-[0_0_20px_rgba(139,92,246,0.3)] border-purple-500/30' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div className={`px-6 py-4 border-b border-white/10 ${className}`}>
    {children}
  </div>
);

export const CardContent = forwardRef<HTMLDivElement, { children: React.ReactNode; className?: string }>(({
  children,
  className = '',
}, ref) => {
  return (
    <div ref={ref} className={`px-6 py-4 ${className}`}>
      {children}
    </div>
  );
});

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div className={`px-6 py-4 border-t border-white/10 ${className}`}>
    {children}
  </div>
);