import React, { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { gsap } from 'gsap';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  const { register, isLoading } = useAuthStore();
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

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    try {
      await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
      });
    } catch (err) {
      setError('Registration failed. Please try again.');
      
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

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8 form-element">
        <h2 className="text-3xl font-bold text-white mb-2">Create your account</h2>
        <p className="text-white/70">
          Join VoyageHub and start planning your perfect vacation
        </p>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        <div className="form-element grid grid-cols-2 gap-4">
          <Input
            type="text"
            label="First Name"
            icon={User}
            value={formData.firstName}
            onChange={handleChange('firstName')}
            required
            placeholder="First name"
          />
          <Input
            type="text"
            label="Last Name"
            icon={User}
            value={formData.lastName}
            onChange={handleChange('lastName')}
            required
            placeholder="Last name"
          />
        </div>

        <div className="form-element">
          <Input
            type="email"
            label="Email"
            icon={Mail}
            value={formData.email}
            onChange={handleChange('email')}
            required
            placeholder="Enter your email"
          />
        </div>

        <div className="form-element relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            label="Password"
            icon={Lock}
            value={formData.password}
            onChange={handleChange('password')}
            required
            placeholder="Create a password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-9 text-white/60 hover:text-white transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <div className="form-element">
          <Input
            type="password"
            label="Confirm Password"
            icon={Lock}
            value={formData.confirmPassword}
            onChange={handleChange('confirmPassword')}
            required
            placeholder="Confirm your password"
          />
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
            Create Account
          </Button>
        </div>
      </form>

      <div className="mt-6 text-center form-element">
        <p className="text-sm text-white/70">
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            className="font-medium text-blue-300 hover:text-blue-200 transition-colors"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};