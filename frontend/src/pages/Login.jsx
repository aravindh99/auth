import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Eye, EyeOff, Lock, Mail, AlertCircle, Loader2, Shield } from 'lucide-react';
import { AuthSplitLayout } from '../components/Layout';

const Login = () => {
  const navigate = useNavigate();
  const { login, error, clearError, isAuthenticated } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email.trim() || !formData.password) {
      return;
    }
    setIsSubmitting(true);
    const result = await login({
      email: formData.email.trim().toLowerCase(),
      password: formData.password
    });
    setIsSubmitting(false);
    if (result.success) {
      navigate('/dashboard');
    } else if (result.needsActivation) {
      navigate(`/activate-account?email=${encodeURIComponent(result.email)}`);
    }
  };

  // Left side content
  const ICON_SIZE = 90;
  const left = (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center' }}>
      {/* Centered icon and text */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ width: ICON_SIZE, height: ICON_SIZE, background: 'rgba(255,255,255,0.15)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <svg width={ICON_SIZE * 0.55} height={ICON_SIZE * 0.55} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><circle cx="12" cy="12" r="4"></circle></svg>
        </div>
        <div style={{ fontWeight: 700, fontSize: 24, letterSpacing: 1, color: '#fff', marginBottom: 8 }}>Xtown Authenticator</div>
        <button
          className="btn btn-link"
          style={{ border: '2px solid #fff', color: '#fff', borderRadius: 24, padding: '0.75rem 2.5rem', fontWeight: 600, fontSize: 18, marginTop: 24 }}
          onClick={() => navigate('/setup')}
        >
          Super Admin Setup
        </button>
      </div>
      {/* Bottom powered by */}
      <div style={{ marginBottom: 24, marginLeft: 8, color: '#fff', fontSize: 20, opacity: 0.95, fontWeight: 600, alignSelf: 'flex-start' }}>
        Powered by Xtown
      </div>
    </div>
  );

  return (
    <AuthSplitLayout left={left}>
      <div style={{
        width: '100%',
        maxWidth: 580,
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0 4px 24px rgba(64, 18, 178, 0.06)',
        padding: '2.5rem 2rem',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <h2 style={{ fontWeight: 700, fontSize: 28, color: '#000', marginBottom: 24, textAlign: 'center' }}>Sign In</h2>
        <form onSubmit={handleSubmit} className="space-y-6" style={{ width: '100%' }}>
          <div className="form-group">
            <label className="form-label" style={{ color: '#000' }}>
              <Mail className="form-label-icon" />
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter your email address"
              required
              style={{ background: '#fff', border: '1px solid #e2e8f0', color: '#000' }}
            />
          </div>
          <div className="form-group">
            <label className="form-label" style={{ color: '#000' }}>
              <Lock className="form-label-icon" />
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`form-input ${showPassword ? '' : 'form-input-password'}`}
                placeholder="Enter your password"
                required
                style={{ background: '#fff', border: '1px solid #e2e8f0', color: '#000' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
          {error && (
            <div className="alert alert-error">
              <AlertCircle className="alert-icon" />
              <span>{error}</span>
            </div>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary btn-full"
            style={{
              borderRadius: 24,
              fontWeight: 600,
              fontSize: 18,
              border: 'none',
              boxShadow: '0 2px 8px rgba(64, 18, 178, 0.08)'
            }}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="btn-icon spinner" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
          <div className="text-center">
            <Link to="/forgot-password" className="btn-link text-sm" style={{ color: '#000' }}>
              Forgot your password?
            </Link>
          </div>
          <div className="text-center">
            <Link to="/activate-account" className="btn-link text-sm" style={{ color: '#000' }}>
              Need to activate your account?
            </Link>
          </div>
        </form>
      </div>
    </AuthSplitLayout>
  );
};

export default Login; 