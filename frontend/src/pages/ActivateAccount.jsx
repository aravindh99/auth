import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authAPI } from '../services/api';
import { 
  Mail, 
  Shield, 
  Check, 
  Loader2, 
  AlertCircle,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';
import { AuthSplitLayout } from '../components/Layout';

const ActivateAccount = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailFromQuery = searchParams.get('email');
  const { activateAccount, loading } = useAuth();

  const [formData, setFormData] = useState({
    email: emailFromQuery || '',
    otp: ''
  });
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  // Countdown timer for resend OTP
  useEffect(() => {
    let timer;
    if (resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setMessage('');
  };

  const handleSendOtp = async () => {
    if (!formData.email.trim()) {
      setMessage('Please enter your email address');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setMessage('Please enter a valid email address');
      return;
    }

    setSendingOtp(true);
    setMessage('');

    try {
      // Use the new sendActivationOTP endpoint for account activation
      const response = await authAPI.sendActivationOTP({ 
        email: formData.email.trim().toLowerCase()
      });

      if (response.data.success) {
        setOtpSent(true);
        setMessage('OTP sent successfully! Please check your email.');
        setResendCountdown(60); // 60 seconds countdown
      } else {
        setMessage(response.data.message || 'Failed to send OTP. Please try again.');
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to send OTP. Please check your connection and try again.';
      setMessage(errorMessage);
    } finally {
      setSendingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCountdown > 0) return;
    
    setSendingOtp(true);
    setMessage('');

    try {
      const response = await authAPI.sendActivationOTP({ 
        email: formData.email.trim().toLowerCase()
      });

      if (response.data.success) {
        setMessage('OTP resent successfully! Please check your email.');
        setResendCountdown(60); // 60 seconds countdown
      } else {
        setMessage(response.data.message || 'Failed to resend OTP. Please try again.');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to resend OTP. Please check your connection and try again.';
      setMessage(errorMessage);
    } finally {
      setSendingOtp(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email.trim()) {
      setMessage('Please enter your email address');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setMessage('Please enter a valid email address');
      return;
    }
    if (!formData.otp.trim()) {
      setMessage('Please enter the OTP code');
      return;
    }
    if (formData.otp.length !== 6) {
      setMessage('OTP must be 6 digits');
      return;
    }
    setMessage('');
    const result = await activateAccount({
      email: formData.email.trim().toLowerCase(),
      otp: formData.otp.trim()
    });
    if (result.success) {
      setIsSuccess(true);
      setMessage(result.message);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } else {
      setMessage(result.error);
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
        maxWidth: 700,
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
          <h1 className="auth-title" style={{ color: '#000' }}>Activate Your Account</h1>
          <p className="auth-subtitle" style={{ color: '#000' }}>
            Enter the OTP sent to your email to activate your account
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6" style={{ width: '100%', maxWidth: 540, margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: 16 }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label" style={{ color: '#000' }}>
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter your email"
                required
                style={{ background: '#fff', border: '1px solid #e2e8f0', color: '#000', minHeight: 48, fontSize: 18, padding: '0.75rem 1rem' }}
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label" style={{ color: '#000' }}>
                OTP Code
              </label>
              <input
                type="text"
                name="otp"
                value={formData.otp}
                onChange={handleInputChange}
                className="form-input otp-input"
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                pattern="[0-9]{6}"
                required
                style={{ background: '#fff', border: '1px solid #e2e8f0', color: '#000', textAlign: 'center', fontSize: 18, letterSpacing: 8, width: '100%', minHeight: 48, padding: '0.75rem 1rem' }}
              />
            </div>
          </div>

          {/* Send OTP Button */}
          {!otpSent && (
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={sendingOtp || !formData.email.trim()}
              className="btn btn-secondary btn-full"
              style={{
                borderRadius: 24,
                fontWeight: 600,
                fontSize: 18,
                border: 'none',
                background: 'linear-gradient(135deg, #211531, #9254de)',
                color: 'white',
                boxShadow: '0 2px 8px rgba(64, 18, 178, 0.08)',
                opacity: sendingOtp || !formData.email.trim() ? 0.6 : 1,
                minHeight: 48,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              {sendingOtp ? (
                <>
                  <Loader2 className="btn-icon spinner" />
                  Sending OTP...
                </>
              ) : (
                <>
                  <Mail className="btn-icon" />
                  Send OTP
                </>
              )}
            </button>
          )}

          {/* Resend OTP Button */}
          {otpSent && (
            <div className="text-center">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={sendingOtp || resendCountdown > 0}
                className="btn-link"
                style={{ 
                  color: resendCountdown > 0 ? '#6b7280' : '#4012b2',
                  textDecoration: 'none',
                  fontSize: 16,
                  opacity: sendingOtp || resendCountdown > 0 ? 0.6 : 1
                }}
              >
                {sendingOtp ? (
                  <>
                    <Loader2 className="btn-icon spinner" style={{ width: 16, height: 16 }} />
                    Resending...
                  </>
                ) : resendCountdown > 0 ? (
                  `Resend OTP in ${resendCountdown}s`
                ) : (
                  <>
                    <RefreshCw className="btn-icon" style={{ width: 16, height: 16 }} />
                    Resend OTP
                  </>
                )}
              </button>
            </div>
          )}

          {message && (
            <div className={`alert ${isSuccess ? 'alert-success' : 'alert-error'} flex items-center`}>
              {isSuccess ? (
                <Check className="alert-icon" />
              ) : (
                <AlertCircle className="alert-icon" />
              )}
              <span>{message}</span>
            </div>
          )}

          {/* Activate Account Button - only show if OTP is sent */}
          {otpSent && (
            <button
              type="submit"
              disabled={loading}
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
              {loading ? (
                <>
                  <Loader2 className="btn-icon spinner" />
                  Activating Account...
                </>
              ) : (
                <>
                  <Shield className="btn-icon" />
                  Activate Account
                </>
              )}
            </button>
          )}

          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="btn-link"
              style={{ color: '#000' }}
            >
              Back to Login
            </button>
          </div>
        </form>
      </div>
    </AuthSplitLayout>
  );
};

export default ActivateAccount; 