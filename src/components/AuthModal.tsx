'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LoginFormData, RegisterFormData } from '@/types/user';
import { Sword, Shield, Zap, X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { login, register, isLoading } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState<LoginFormData & RegisterFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    nickname: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      let success = false;

      if (isLogin) {
        success = await login({
          email: formData.email,
          password: formData.password,
        });
      } else {
        success = await register({
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          nickname: formData.nickname,
        });
      }

      if (success) {
        setSuccess(isLogin ? 'Login successful!' : 'Registration successful!');
        setTimeout(() => {
          onClose();
          setFormData({ email: '', password: '', confirmPassword: '', nickname: '' });
          // Redirect to game page after successful login/registration
          router.push('/game');
        }, 1000);
      } else {
        setError(isLogin ? 'Invalid email or password' : 'Registration failed. Please try again.');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccess('');
    setFormData({ email: '', password: '', confirmPassword: '', nickname: '' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-primary-brown to-primary-deep-orange rounded-2xl p-8 max-w-md w-full border-2 border-custom shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <Sword className="w-6 h-6 text-white" />
            <h2 className="text-2xl font-bold text-white">
              {isLogin ? 'Login' : 'Register'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-primary-yellow transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="bg-red-500 text-white p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-primary-green text-white p-3 rounded-lg mb-4 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Nickname
              </label>
              <input
                type="text"
                name="nickname"
                value={formData.nickname}
                onChange={handleInputChange}
                required={!isLogin}
                className="w-full px-4 py-3 bg-gray-800 border-2 border-custom rounded-lg focus:outline-none focus:border-primary-yellow transition-colors"
                placeholder="Enter your nickname"
              />
            </div>
          )}

          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-gray-800 border-2 border-custom rounded-lg focus:outline-none focus:border-primary-yellow transition-colors"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-gray-800 border-2 border-custom rounded-lg focus:outline-none focus:border-primary-yellow transition-colors"
              placeholder="Enter your password"
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required={!isLogin}
                className="w-full px-4 py-3 bg-gray-800 border-2 border-custom rounded-lg focus:outline-none focus:border-primary-yellow transition-colors"
                placeholder="Confirm your password"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-primary-green to-primary-blue text-white py-3 px-6 rounded-lg font-semibold hover:from-primary-blue to-primary-green transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                {isLogin ? 'Logging in...' : 'Registering...'}
              </div>
            ) : (
              isLogin ? 'Login' : 'Register'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={toggleMode}
            className="text-primary-yellow hover:text-white transition-colors text-sm"
          >
            {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
          </button>
        </div>

        <div className="mt-6 flex justify-center space-x-4">
          <div className="flex items-center space-x-1 text-white text-xs">
            <Sword className="w-4 h-4" />
            <span>Battles</span>
          </div>
          <div className="flex items-center space-x-1 text-white text-xs">
            <Shield className="w-4 h-4" />
            <span>Guilds</span>
          </div>
          <div className="flex items-center space-x-1 text-white text-xs">
            <Zap className="w-4 h-4" />
            <span>Trading</span>
          </div>
        </div>
      </div>
    </div>
  );
}
