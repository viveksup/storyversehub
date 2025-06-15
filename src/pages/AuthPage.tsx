import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { z } from 'zod';
import { supabase } from '../lib/supabase';
import Button from '../components/ui/Button';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const validateForm = () => {
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
      
      if (!isLogin) {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (!acceptTerms) {
          throw new Error('Please accept the terms and conditions');
        }
      }
      
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else if (err instanceof Error) {
        setError(err.message);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          if (error.message === 'Email not confirmed') {
            throw new Error('Please check your email for a confirmation link to activate your account.');
          }
          throw error;
        }
        
        navigate(from, { replace: true });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: email.split('@')[0],
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        
        if (error) throw error;
        
        setIsLogin(true);
        setSuccess('Account created successfully! Please check your email to confirm your account before signing in.');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-space-dark pt-20">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <div className="bg-space-base/90 backdrop-blur-sm rounded-2xl p-8 border border-space-light/20 shadow-cosmic">
            <h1 className="text-3xl font-display font-bold text-white mb-6 text-center">
              {isLogin ? 'Welcome Back' : 'Join StoryVerse Hub'}
            </h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-space-dark/50 border border-space-light/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 pl-10"
                    placeholder="Enter your email"
                    required
                  />
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              
              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-space-dark/50 border border-space-light/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 pl-10 pr-10"
                    placeholder="Enter your password"
                    required
                  />
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              
              {/* Confirm Password Field (Sign Up only) */}
              {!isLogin && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-space-dark/50 border border-space-light/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 pl-10"
                      placeholder="Confirm your password"
                      required
                    />
                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
              )}
              
              {/* Additional Options */}
              <div className="space-y-4">
                {isLogin ? (
                  <div className="flex items-center justify-between">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-300">Remember me</span>
                    </label>
                    <button
                      type="button"
                      className="text-sm text-primary-400 hover:text-primary-300"
                      onClick={() => navigate('/auth/reset-password')}
                    >
                      Forgot password?
                    </button>
                  </div>
                ) : (
                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="w-4 h-4 mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-300">
                      I accept the{' '}
                      <button
                        type="button"
                        onClick={() => navigate('/terms')}
                        className="text-primary-400 hover:text-primary-300"
                      >
                        terms and conditions
                      </button>
                    </span>
                  </label>
                )}
              </div>
              
              {/* Error Message */}
              {error && (
                <div className="bg-error-900/50 border border-error-500/50 rounded-lg p-3 flex items-start">
                  <AlertCircle size={18} className="text-error-400 flex-shrink-0 mt-0.5 mr-2" />
                  <p className="text-sm text-error-400">{error}</p>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="bg-green-900/50 border border-green-500/50 rounded-lg p-3 flex items-start">
                  <AlertCircle size={18} className="text-green-400 flex-shrink-0 mt-0.5 mr-2" />
                  <p className="text-sm text-green-400">{success}</p>
                </div>
              )}
              
              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin mr-2" />
                    {isLogin ? 'Signing in...' : 'Creating account...'}
                  </>
                ) : (
                  isLogin ? 'Sign In' : 'Create Account'
                )}
              </Button>
              
              {/* Toggle Login/Signup */}
              <p className="text-center text-gray-400 text-sm">
                {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError('');
                  }}
                  className="text-primary-400 hover:text-primary-300 font-medium"
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;