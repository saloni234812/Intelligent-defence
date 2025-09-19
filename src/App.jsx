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
      try {
        const res = await fetch('http://localhost:5000/api/users/me', {
          method: 'GET',
          credentials: 'include', // send cookies
        });
        const data = await res.json();
        if (res.ok) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        setUser(null);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

  // Callback when login/signup succeeds
  const handleLogin = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/users/me', {
        method: 'GET',
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) setUser(data.user);
    } catch (err) {
      console.error(err);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-100 bg-slate-900">
        Checking authentication...
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
