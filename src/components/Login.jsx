/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import {
  Shield,
  Lock,
  User,
  Mail,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

const Login = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    clearanceLevel: 'Level-1'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverMessage, setServerMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.username && !isLogin) newErrors.username = 'Username is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (!isLogin && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerMessage('');
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : { name: formData.username, email: formData.email, password: formData.password };

      const endpoint = isLogin
        ? 'http://localhost:5000/api/users/login'
        : 'http://localhost:5000/api/users/signup';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Important for cookies
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        setServerMessage(data.message || 'Authentication failed');
      } else {
        setServerMessage(data.message || (isLogin ? 'Logged in!' : 'Account created!'));
        if (onLogin) onLogin(); // Refresh auth state in App.jsx
      }
    } catch (err) {
      setServerMessage('Network error, try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 text-gray-100 min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-10 h-10 text-cyan-400" />
            <div>
              <h1 className="text-2xl font-mono text-cyan-400">AEGIS DEFENSE</h1>
              <p className="text-xs text-gray-400">SECURE ACCESS PORTAL</p>
            </div>
          </div>
          <div className="text-xs font-mono text-red-400 bg-red-900/20 border border-red-800 px-3 py-1 rounded">
            CLASSIFIED SYSTEM - AUTHORIZED PERSONNEL ONLY
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          {/* Tab Switcher */}
          <div className="flex mb-6 bg-slate-700 rounded-lg p-1">
            <button
              className={`flex-1 py-2 px-4 text-sm font-mono rounded-md transition-colors ${
                isLogin ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:text-gray-200'
              }`}
              onClick={() => setIsLogin(true)}
            >
              <Lock className="w-4 h-4 inline mr-2" />
              LOGIN
            </button>
            <button
              className={`flex-1 py-2 px-4 text-sm font-mono rounded-md transition-colors ${
                !isLogin ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:text-gray-200'
              }`}
              onClick={() => setIsLogin(false)}
            >
              <User className="w-4 h-4 inline mr-2" />
              REGISTER
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">USERNAME / AGENT ID</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full bg-slate-900 border border-slate-600 rounded px-10 py-2 text-sm font-mono focus:border-cyan-400 focus:outline-none"
                    placeholder="Enter agent ID..."
                  />
                </div>
                {errors.username && (
                  <p className="text-red-400 text-xs mt-1 flex items-center">
                    <AlertTriangle className="w-3 h-3 mr-1" /> {errors.username}
                  </p>
                )}
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1">EMAIL ADDRESS</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900 border border-slate-600 rounded px-10 py-2 text-sm font-mono focus:border-cyan-400 focus:outline-none"
                  placeholder="agent@defense.gov"
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-xs mt-1 flex items-center">
                  <AlertTriangle className="w-3 h-3 mr-1" /> {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1">PASSWORD</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900 border border-slate-600 rounded px-10 py-2 text-sm font-mono focus:border-cyan-400 focus:outline-none pr-10"
                  placeholder="Enter secure password..."
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1 flex items-center">
                  <AlertTriangle className="w-3 h-3 mr-1" /> {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            {!isLogin && (
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">CONFIRM PASSWORD</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full bg-slate-900 border border-slate-600 rounded px-10 py-2 text-sm font-mono focus:border-cyan-400 focus:outline-none"
                    placeholder="Confirm password..."
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-400 text-xs mt-1 flex items-center">
                    <AlertTriangle className="w-3 h-3 mr-1" /> {errors.confirmPassword}
                  </p>
                )}
              </div>
            )}

            {/* Security Clearance */}
            {!isLogin && (
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">SECURITY CLEARANCE</label>
                <select
                  name="clearanceLevel"
                  value={formData.clearanceLevel}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm font-mono focus:border-cyan-400 focus:outline-none"
                >
                  <option value="Level-1">Level-1 (Confidential)</option>
                  <option value="Level-2">Level-2 (Secret)</option>
                  <option value="Level-3">Level-3 (Top Secret)</option>
                </select>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-3 px-4 rounded font-mono text-sm transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              {loading ? 'Processing...' : isLogin ? 'AUTHENTICATE' : 'REQUEST ACCESS'}
            </button>

            {serverMessage && (
              <p
                className={`mt-2 text-xs font-mono text-center ${
                  serverMessage.toLowerCase().includes('error') ||
                  serverMessage.toLowerCase().includes('invalid')
                    ? 'text-red-400'
                    : 'text-green-400'
                }`}
              >
                {serverMessage}
              </p>
            )}
          </form>
        </div>
 
      </div>
    </div>
  );
};

export default Login;
