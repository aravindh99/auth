import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AlertCircle, CheckCircle, Loader2, Mail, Lock, ArrowLeft, Eye, EyeOff, Shield, RefreshCw } from 'lucide-react';
import { AuthSplitLayout } from '../components/Layout';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { forgotPassword, resetPassword, error, clearError } = useAuth();
  
  const [step, setStep] = useState(1); // 1: Email, 2: OTP + New Password
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    clearError();
    setMessage('');
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email.trim()) {
      setMessage('Please enter your email address');
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setMessage('Please enter a valid email address');
      return;
    }
    
    setIsSubmitting(true);
    
    const result = await forgotPassword(formData.email.trim().toLowerCase());
    
    setIsSubmitting(false);
    
    if (result.success) {
      setStep(2);
      setMessage('Reset code sent to your email. Please check your inbox.');
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    
    const { otp, password, confirmPassword } = formData;
    
    if (!otp.trim()) {
      setMessage('Please enter the reset code');
      return;
    }
    
    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      setMessage('Reset code must be a 6-digit number');
      return;
    }
    
    if (!password || password.length < 8) {
      setMessage('Password must be at least 8 characters long');
      return;
    }
    
    if (!/^(?=.*[A-Za-z])(?=.*\d)/.test(password)) {
      setMessage('Password must contain at least one letter and one number');
      return;
    }
    
    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }
    
    setIsSubmitting(true);
    
    const result = await resetPassword({
      email: formData.email.trim().toLowerCase(),
      otp: otp.trim(),
      password
    });
    
    setIsSubmitting(false);
    
    if (result.success) {
      setMessage('Password reset successfully! You can now sign in with your new password.');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    }
  };

  const resendCode = async () => {
    setIsSubmitting(true);
    
    const result = await forgotPassword(formData.email.trim().toLowerCase());
    
    setIsSubmitting(false);
    
    if (result.success) {
      setMessage('Reset code resent to your email');
    }
  };

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
          onClick={() => navigate('/login')}
        >
          Back to Login
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
        maxWidth: 500,
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0 4px 24px rgba(64, 18, 178, 0.06)',
        padding: '2.5rem 2rem',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <div className="auth-header">
          <h1 className="auth-title" style={{ color: '#000' }}>{step === 1 ? 'Forgot Password' : 'Reset Password'}</h1>
          <p className="auth-subtitle" style={{ color: '#000' }}>
            {step === 1 
              ? 'Enter your email to receive a reset code' 
              : 'Enter the code and your new password'
            }
          </p>
        </div>
        {step === 1 ? (
          <form onSubmit={handleEmailSubmit} className="space-y-6" style={{ width: '100%', maxWidth: 400, margin: '0 auto' }}>
            <div className="form-group">
              <label className="form-label" style={{ color: '#000' }}>
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
                style={{ background: '#fff', border: '1px solid #e2e8f0', color: '#000', minHeight: 48, fontSize: 18, padding: '0.75rem 1rem' }}
              />
            </div>
            {(error || message) && (
              <div className={`alert ${error ? 'alert-error' : 'alert-info'} flex items-center`}>
                {error ? (
                  <AlertCircle className="alert-icon" />
                ) : (
                  <CheckCircle className="alert-icon" />
                )}
                <span>{error || message}</span>
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
                background: 'linear-gradient(135deg, #211531, #9254de)',
                color: 'white',
                boxShadow: '0 2px 8px rgba(64, 18, 178, 0.08)',
                minHeight: 48,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="btn-icon spinner" />
                  Sending Code...
                </>
              ) : (
                <>
                  <Mail className="btn-icon" />
                  Send Reset Code
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handlePasswordReset} className="space-y-6" style={{ width: '100%', maxWidth: 400, margin: '0 auto' }}>
            {/* Reset Code Input */}
            <div className="form-group">
              <label className="form-label" style={{ color: '#000' }}>
                Reset Code
              </label>
              <input
                type="text"
                name="otp"
                value={formData.otp}
                onChange={handleInputChange}
                className="form-input otp-input"
                placeholder="000000"
                maxLength="6"
                pattern="[0-9]{6}"
                required
                style={{ background: '#fff', border: '1px solid #e2e8f0', color: '#000', textAlign: 'center', fontSize: 18, letterSpacing: 8, width: '100%', minHeight: 48, padding: '0.75rem 1rem' }}
              />
            </div>

            {/* New Password Input */}
            <div className="form-group">
              <label className="form-label" style={{ color: '#000' }}>
                <Lock className="form-label-icon" style={{ width: 16, height: 16, marginRight: 8 }} />
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter your new password"
                  required
                  style={{ background: '#fff', border: '1px solid #e2e8f0', color: '#000', minHeight: 48, fontSize: 18, padding: '0.75rem 1rem', paddingRight: '3rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className="form-group">
              <label className="form-label" style={{ color: '#000' }}>
                <Lock className="form-label-icon" style={{ width: 16, height: 16, marginRight: 8 }} />
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Confirm your new password"
                  required
                  style={{ background: '#fff', border: '1px solid #e2e8f0', color: '#000', minHeight: 48, fontSize: 18, padding: '0.75rem 1rem', paddingRight: '3rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="password-toggle"
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {(error || message) && (
              <div className={`alert ${error ? 'alert-error' : 'alert-success'} flex items-center`}>
                {error ? (
                  <AlertCircle className="alert-icon" />
                ) : (
                  <CheckCircle className="alert-icon" />
                )}
                <span>{error || message}</span>
              </div>
            )}

            {/* Reset Password Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary btn-full"
              style={{
                borderRadius: 24,
                fontWeight: 600,
                fontSize: 18,
                border: 'none',
                background: 'linear-gradient(135deg, #211531, #9254de)',
                color: 'white',
                boxShadow: '0 2px 8px rgba(64, 18, 178, 0.08)',
                minHeight: 48,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="btn-icon spinner" />
                  Resetting Password...
                </>
              ) : (
                <>
                  <Shield className="btn-icon" />
                  Reset Password
                </>
              )}
            </button>

            {/* Resend Code Button */}
            <div className="text-center">
              <button
                type="button"
                onClick={resendCode}
                disabled={isSubmitting}
                className="btn-link"
                style={{ 
                  color: '#4012b2', 
                  textDecoration: 'none',
                  fontSize: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  margin: '0 auto'
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="btn-icon spinner" style={{ width: 16, height: 16 }} />
                    Resending...
                  </>
                ) : (
                  <>
                    <RefreshCw className="btn-icon" style={{ width: 16, height: 16 }} />
                    Didn't receive the code? Resend
                  </>
                )}
              </button>
            </div>

            {/* Back to Email Entry */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn-link"
                style={{ 
                  color: '#000',
                  textDecoration: 'none',
                  fontSize: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  margin: '0 auto'
                }}
              >
                <ArrowLeft className="btn-icon" style={{ width: 16, height: 16 }} />
                Back to email entry
              </button>
            </div>
          </form>
        )}
        <div className="mt-8 text-center">
          <Link
            to="/login"
            className="btn-link flex items-center justify-center text-sm"
            style={{ color: '#000' }}
          >
            Back to Login
          </Link>
        </div>
      </div>
    </AuthSplitLayout>
  );
};

export default ForgotPassword; 