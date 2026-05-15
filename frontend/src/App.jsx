import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';

import WelcomeScreen     from './components/WelcomeScreen';
import ModeSelection     from './components/ModeSelection';
import LearningMode      from './components/LearningMode';
import ProgressDashboard from './components/ProgressDashboard';
import TestMode          from './components/TestMode';
import MiniGame          from './components/MiniGame';
import LoginPage         from './components/LoginPage';
import SignupPage        from './components/SignupPage';
import SettingsPanel     from './components/SettingsPanel';
import './App.css';

// Auth guard – redirects to /login if not signed in
const Protected = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

function AppRoutes() {
  const { user } = useAuth();
  return (
    <>
      {/* Settings cog is always visible when logged in */}
      {user && <SettingsPanel />}

      <Routes>
        <Route path="/login"  element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route path="/" element={<Protected><WelcomeScreen /></Protected>} />
        <Route path="/select" element={<Protected><ModeSelection /></Protected>} />
        <Route path="/learn/:type" element={<Protected><LearningMode /></Protected>} />
        <Route path="/dashboard" element={<Protected><ProgressDashboard /></Protected>} />
        <Route path="/test" element={<Protected><TestMode /></Protected>} />
        <Route path="/game" element={<Protected><MiniGame /></Protected>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <Router>
          <div className="app-container">
            <AppRoutes />
          </div>
        </Router>
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;
