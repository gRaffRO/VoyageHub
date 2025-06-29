import React, { useState, useRef, useEffect } from 'react';
import { LoginForm } from '../components/auth/LoginForm';
import { RegisterForm } from '../components/auth/RegisterForm';
import { Plane, MapPin, Calendar, Users, Star, Globe, Camera, Heart } from 'lucide-react';
import { gsap } from 'gsap';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && leftPanelRef.current && rightPanelRef.current) {
      // Initial animation
      gsap.fromTo(leftPanelRef.current,
        { x: -100, opacity: 0 },
        { x: 0, opacity: 1, duration: 1, ease: "power3.out" }
      );

      gsap.fromTo(rightPanelRef.current,
        { x: 100, opacity: 0 },
        { x: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 0.2 }
      );

      // Floating animations for feature cards
      const featureCards = leftPanelRef.current.querySelectorAll('.feature-card');
      // Removed heavy floating animations

      // Particle animation
      createParticles();
    }
  }, []);

  const createParticles = () => {
    const particleContainer = document.querySelector('.particles');
    if (!particleContainer) return;

    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 20 + 's';
      particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
      particleContainer.appendChild(particle);
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen relative overflow-hidden">
      {/* Particles */}
      <div className="particles"></div>
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="flex min-h-screen relative z-10">
        {/* Left side - Branding */}
        <div ref={leftPanelRef} className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          <div className="glass-dark w-full flex flex-col justify-center items-center text-white p-12">
            <div className="max-w-md text-center">
              <div className="flex items-center justify-center mb-8">
                <div className="w-20 h-20 glass-card rounded-3xl flex items-center justify-center floating-animation">
                  <Plane className="h-10 w-10 text-white" />
                </div>
              </div>
              
              <h1 className="text-5xl font-bold mb-4 gradient-text">
                Welcome to VoyageHub
              </h1>
              <p className="text-xl text-white/80 mb-12">
                Plan, organize, and collaborate on your perfect vacation with cutting-edge technology
              </p>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="feature-card glass-card rounded-2xl p-6">
                  <MapPin className="h-8 w-8 mb-3 text-blue-300" />
                  <p className="text-sm font-medium">Multiple Destinations</p>
                  <p className="text-xs text-white/60 mt-1">Plan complex multi-city trips</p>
                </div>
                <div className="feature-card glass-card rounded-2xl p-6">
                  <Calendar className="h-8 w-8 mb-3 text-green-300" />
                  <p className="text-sm font-medium">Smart Planning</p>
                  <p className="text-xs text-white/60 mt-1">AI-powered itinerary optimization</p>
                </div>
                <div className="feature-card glass-card rounded-2xl p-6">
                  <Users className="h-8 w-8 mb-3 text-purple-300" />
                  <p className="text-sm font-medium">Team Collaboration</p>
                  <p className="text-xs text-white/60 mt-1">Real-time planning with friends</p>
                </div>
                <div className="feature-card glass-card rounded-2xl p-6">
                  <Star className="h-8 w-8 mb-3 text-yellow-300" />
                  <p className="text-sm font-medium">Premium Experience</p>
                  <p className="text-xs text-white/60 mt-1">Luxury travel management</p>
                </div>
              </div>

              <div className="mt-12 flex items-center justify-center space-x-8">
                <div className="flex items-center space-x-2 text-white/60">
                  <Globe className="h-4 w-4" />
                  <span className="text-sm">50+ Countries</span>
                </div>
                <div className="flex items-center space-x-2 text-white/60">
                  <Camera className="h-4 w-4" />
                  <span className="text-sm">1M+ Photos</span>
                </div>
                <div className="flex items-center space-x-2 text-white/60">
                  <Heart className="h-4 w-4" />
                  <span className="text-sm">100K+ Happy Travelers</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Auth Form */}
        <div ref={rightPanelRef} className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="glass-card rounded-3xl p-8">
              {isLogin ? (
                <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
              ) : (
                <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};