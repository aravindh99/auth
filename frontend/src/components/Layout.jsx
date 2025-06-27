import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Navigate, useLocation } from 'react-router-dom';
import '../styles/Layout.module.css';

const Layout = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  
  // Don't redirect on login page
  const isLoginPage = location.pathname === '/login';
  const isSetupPage = location.pathname === '/setup';
  const isForgotPasswordPage = location.pathname === '/forgot-password';
  const isActivateAccountPage = location.pathname === '/activate-account';
  
  const isPublicPage = isLoginPage || isSetupPage || isForgotPasswordPage || isActivateAccountPage;

  if (!user && !isPublicPage) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="layout">
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

// New AuthSplitLayout for split-screen auth pages
export const AuthSplitLayout = ({
  left,
  children,
  className = '',
}) => (
  <>
    {/* Persistent logo at top left */}
    <img
      src="/assets/xtown-light.png"
      alt="Xtown Logo"
      style={{
        position: 'fixed',
        top: 24,
        left: 32,
        width: 250,
        height: 60,
        zIndex: 100,
        objectFit: 'contain',
      }}
    />
    <div className={`auth-split-layout ${className}`} style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-secondary)' }}>
      <div className="auth-split-left">
        {left}
      </div>
      <div className="auth-split-right">
        {children}
      </div>
    </div>
  </>
);

export default Layout; 