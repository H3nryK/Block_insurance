import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from './components/AuthContext';

import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';

const App = () => {
  const { isAuthenticated, login, logout } = useAuth();

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage onLogin={login} />
          } />
          <Route path="/dashboard" element={
            isAuthenticated ? <Dashboard onLogout={logout} /> : <Navigate to="/" replace />
          } />
          <Route path="/profile" element={
            isAuthenticated ? <Profile onLogout={logout} /> : <Navigate to="/" replace />
          } />
        </Routes>
      </div>
    </Router>
  );
};

export default App;