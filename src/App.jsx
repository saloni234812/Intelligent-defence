/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import Login from './components/Login';
import MainPage from './pages/Main'; // legacy main view
import Dashboard from './components/Dashboard';
import TacticalMap from './components/TacticalMap';

const App = () => {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Check authentication on app load
  useEffect(() => {
    const checkAuth = async () => {
      console.log('Starting authentication check...');
      try {
        const res = await fetch('/api/users/me', {
          method: 'GET',
          credentials: 'include', // send cookies
        });
        console.log('Auth response status:', res.status);
        const data = await res.json();
        console.log('Auth response data:', data);
        if (res.ok) {
          setUser(data.user);
          console.log('Initial auth check - User authenticated:', data.user);
        } else {
          setUser(null);
          console.log('Initial auth check - Not authenticated:', data);
        }
      } catch (err) {
        setUser(null);
        console.log('Initial auth check - Error:', err);
      } finally {
        console.log('Authentication check completed, setting checkingAuth to false');
        setCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

  // Callback when login/signup succeeds
  const handleLogin = async () => {
    try {
      const res = await fetch('/api/users/me', {
        method: 'GET',
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        console.log('User authenticated:', data.user);
      } else {
        console.error('Auth check failed:', data);
      }
    } catch (err) {
      console.error('Auth check error:', err);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-100 bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p>Checking authentication...</p>
          <p className="text-sm text-gray-400 mt-2">If this takes too long, check the browser console for errors</p>
        </div>
      </div>
    );
  }

  const ProtectedRoute = ({ children }) => {
    return user ? children : <Navigate to="/login" replace />;
  };

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <div className="p-4">
                <Nav />
                <Dashboard />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tactical"
          element={
            <ProtectedRoute>
              <div className="p-4">
                <Nav />
                <TacticalMap />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={user ? <MainPage user={user} setUser={setUser} /> : <Navigate to="/login" replace />}
        />
        <Route path="*" element={<Navigate to={user ? '/' : '/login'} replace />} />
      </Routes>
    </>
  );
};

export default App;

const Nav = () => (
  <div className="mb-4 flex gap-3 text-sm">
    <Link to="/dashboard" className="bg-slate-800 border border-slate-700 px-3 py-1 rounded text-gray-200 hover:border-cyan-400">Dashboard</Link>
    <Link to="/tactical" className="bg-slate-800 border border-slate-700 px-3 py-1 rounded text-gray-200 hover:border-cyan-400">Tactical Map</Link>
    <Link to="/" className="bg-slate-800 border border-slate-700 px-3 py-1 rounded text-gray-200 hover:border-cyan-400">Main</Link>
  </div>
);
