import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';

// Import Screens
import WelcomeScreen from './components/WelcomeScreen';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import ModeSelection from './components/ModeSelection';
import LearningMode from './components/LearningMode';
import TestMode from './components/TestMode';
import SnakeLadderGame from './components/SnakeLadderGame';
import ParentDashboard from './components/ParentDashboard';
import TeacherDashboard from './components/TeacherDashboard';

// Custom Route Guard
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <SettingsProvider>
          <Routes>
            {/* Public Entry Screens */}
            <Route path="/" element={<WelcomeScreen />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Protected Learning & Game Screens */}
            <Route 
              path="/mode-selection" 
              element={
                <ProtectedRoute>
                  <ModeSelection />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/learning-alphabets" 
              element={
                <ProtectedRoute>
                  <LearningMode mode="alphabet" />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/learning-numbers" 
              element={
                <ProtectedRoute>
                  <LearningMode mode="number" />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/test-mode" 
              element={
                <ProtectedRoute>
                  <TestMode />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/snake-ladder" 
              element={
                <ProtectedRoute>
                  <SnakeLadderGame />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/parent-dashboard" 
              element={
                <ProtectedRoute>
                  <ParentDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/teacher-dashboard" 
              element={
                <ProtectedRoute>
                  <TeacherDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SettingsProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
