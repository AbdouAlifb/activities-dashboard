import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import Input from '../components/Input';
import Button from '../components/Button';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const validate = () => {
    const newErrors = {};
    if (!username.trim()) {
      newErrors.username = 'Username is required';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setLoading(true);
    const result = await login(username, password);
    setLoading(false);
    
    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Hero Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-primary-600 to-primary-800 overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        {/* Image overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/90 to-primary-900/90"></div>

        {/* Image - using Unsplash for travel/activities theme */}
        <div className="absolute inset-0 bg-cover bg-center" style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&q=80')`,
          filter: 'brightness(0.7)'
        }}></div>

        {/* Content overlay */}
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="max-w-md">
            <div className="mb-6">
              <img
                src="/logo.png"
                alt="CardND"
                className="h-16 w-auto brightness-0 invert"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="50"><text x="10" y="30" font-family="Arial" font-size="20" fill="%23ffffff">CardND</text></svg>';
                }}
              />
            </div>
            <h2 className="text-4xl font-bold mb-4">Welcome Back</h2>
            <p className="text-lg text-primary-100 mb-8">
              Manage unforgettable experiences and activities around the world. Your gateway to adventure management.
            </p>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-primary-50">Manage activities & experiences</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-primary-50">Track reservations & bookings</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-primary-50">Analytics & insights</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="w-full max-w-md">
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <img
                src="/logo.png"
                alt="CardND"
                className="h-16 md:h-20 w-auto"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="50"><text x="10" y="30" font-family="Arial" font-size="20" fill="%23047857">CardND</text></svg>';
                }}
              />
            </div>
            <p className="text-slate-600 mt-2">Sign in to your dashboard</p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Username"
                type="text"
                placeholder="Enter your username"
                icon={User}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                error={errors.username}
                autoComplete="username"
                autoFocus
              />

              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  icon={Lock}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={errors.password}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <Button
                type="submit"
                fullWidth
                size="lg"
                loading={loading}
              >
                Sign In
              </Button>
            </form>

            {/* Footer */}
            <p className="text-center text-sm text-slate-500 mt-6">
              Protected by role-based access control
            </p>
          </div>

          {/* Copyright */}
          <p className="text-center text-sm text-slate-500 mt-8">
            © {new Date().getFullYear()} CardND SARL AU. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
