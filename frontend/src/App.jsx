import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthProvider from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingScreen from './components/LoadingScreen';
import LoadingOverlay from './components/LoadingOverlay';
import Login from './pages/Login';
import SuperAdminSetup from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ActivateAccount from './pages/ActivateAccount';
import Dashboard from './pages/Dashboard';
import { useAuth } from './hooks/useAuth';

function AppContent() {
  const { isInitializing, isLoading } = useAuth();

  if (isInitializing) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Router>
        <div className="App">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/setup" element={<SuperAdminSetup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/activate-account" element={<ActivateAccount />} />
            
            {/* Protected routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
      
      {/* Global loading overlay for API calls */}
      <LoadingOverlay 
        isVisible={isLoading} 
        message="Processing your request..."
      />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
