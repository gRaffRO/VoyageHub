import React, { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { gsap } from 'gsap';

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  const { login, isLoading } = useAuthStore();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (formRef.current) {
      const elements = formRef.current.querySelectorAll('.form-element');
      gsap.fromTo(elements,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power2.out" }
      );
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
    } catch (err) {
      setError('Invalid email or password');
      
      // Shake animation on error
      if (formRef.current) {
        gsap.to(formRef.current, {
          x: [-10, 10, -10, 10, 0],
          duration: 0.5,
          ease: "power2.out"
        });
      }
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8 form-element">
        <h2 className="text-3xl font-bold text-white mb-2">Welcome back</h2>
        <p className="text-white/70">
          Sign in to your VoyageHub account
        </p>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        <div className="form-element">
          <Input
            type="email"
            label="Email"
            icon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
          />
        </div>

        <div className="form-element relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            label="Password"
            icon={Lock}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-9 text-white/60 hover:text-white transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        {error && (
          <div className="form-element text-red-300 text-sm text-center glass-card p-3 rounded-xl border border-red-400/30">
            {error}
          </div>
        )}

        <div className="form-element">
          <Button
            type="submit"
            fullWidth
            loading={isLoading}
            glow
            className="mt-6"
          >
            Sign In
          </Button>
        </div>
      </form>

      <div className="mt-6 text-center form-element">
        <p className="text-sm text-white/70">
          Don't have an account?{' '}
          <button
            onClick={onSwitchToRegister}
            className="font-medium text-blue-300 hover:text-blue-200 transition-colors"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
};