import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AlertCircle, CheckCircle, Loader2, Mail, Lock, User, Building, Eye, EyeOff } from 'lucide-react';
import { AuthSplitLayout } from '../components/Layout';
import { validateSuperAdminRegistration, validateOTP } from '../utils/validation';

const SuperAdminSetup = () => {
  const navigate = useNavigate();
  const { registerSuperAdmin, verifySuperAdminOTP, checkSuperAdminExists, error, clearError } = useAuth();
  
  const [step, setStep] = useState(1); // 1: Registration Form, 2: OTP Verification
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    otp: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [superAdminExists, setSuperAdminExists] = useState(false);
  const [superAdminData, setSuperAdminData] = useState(null);
  const [isChecking, setIsChecking] = useState(true);

  // Check if Super Admin exists on component mount
  useEffect(() => {
    const checkSuperAdmin = async () => {
      setIsChecking(true);
      const result = await checkSuperAdminExists();
      
      if (result.success) {
        setSuperAdminExists(result.exists);
        setSuperAdminData(result.data);
      } else {
        setMessage('Failed to check Super Admin status. Please try again.');
      }
      
      setIsChecking(false);
    };

    checkSuperAdmin();
  }, [checkSuperAdminExists]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Only clear error if there is one
    if (error) {
      clearError();
    }
    // Only clear message if it's an error message
    if (message && message.includes('error')) {
      setMessage('');
    }
  };

  const handleRegistration = async (e) => {
    e.preventDefault();
    
    // Use the comprehensive validation function that matches backend exactly
    const validation = validateSuperAdminRegistration(formData);
    if (!validation.valid) {
      setMessage(validation.message);
      return;
    }
    
    setIsSubmitting(true);
    
    const { name, email, password, confirmPassword, companyName } = formData;
    const result = await registerSuperAdmin({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      confirmPassword,
      companyName: companyName.trim()
    });
    
    setIsSubmitting(false);
    
    if (result.success) {
      setStep(2);
      setMessage('OTP sent to your email. Please check your inbox and enter the verification code.');
    }
  };

  const handleOTPVerification = async (e) => {
    e.preventDefault();
    
    // Use the validation function that matches backend exactly
    const otpValidation = validateOTP(formData.otp);
    if (!otpValidation.valid) {
      setMessage(otpValidation.message);
      return;
    }
    
    setIsSubmitting(true);
    
    const { name, email, password, confirmPassword, companyName, otp } = formData;
    const result = await verifySuperAdminOTP({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      confirmPassword,
      companyName: companyName.trim(),
      otp: otp.trim()
    });
    
    setIsSubmitting(false);
    
    if (result.success) {
      setMessage('Super Admin account created successfully!');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    }
  };

  const resendOTP = async () => {
    setIsSubmitting(true);
    
    const { name, email, password, confirmPassword, companyName } = formData;
    const result = await registerSuperAdmin({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      confirmPassword,
      companyName: companyName.trim()
    });
    
    setIsSubmitting(false);
    
    if (result.success) {
      setMessage('OTP resent to your email');
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
          Sign In
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
        {isChecking ? (
          <div className="auth-header">
            <img src="/assets/xtown-light.png" alt="Xtown Authenticator" style={{ width: 60, height: 60, objectFit: 'contain', margin: '0 auto 1rem' }} />
            <h1 className="auth-title" style={{ color: '#000' }}>Checking Super Admin Status</h1>
            <div className="flex justify-center mt-6">
              <Loader2 className="h-8 w-8 spinner" />
            </div>
          </div>
        ) : superAdminExists ? (
          <div className="auth-header">
            <img src="/assets/xtown-light.png" alt="Xtown Authenticator" style={{ width: 60, height: 60, objectFit: 'contain', margin: '0 auto 1rem' }} />
            <h1 className="auth-title" style={{ color: '#000' }}>Super Admin Already Exists</h1>
            <p className="auth-subtitle" style={{ color: '#000' }}>Only one Super Admin is allowed in the system</p>
            
            <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center mb-4">
                <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                <h3 className="text-lg font-medium text-yellow-800">System Administrator Found</h3>
              </div>
              
              {superAdminData && (
                <div className="space-y-2 text-sm text-yellow-700">
                  <p><strong>Name:</strong> {superAdminData.name}</p>
                  <p><strong>Email:</strong> {superAdminData.email}</p>
                  <p><strong>Created:</strong> {new Date(superAdminData.createdAt).toLocaleDateString()}</p>
                </div>
              )}
              
              <p className="mt-4 text-yellow-700">
                The system already has a Super Admin. If you need access, please contact the existing administrator.
              </p>
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={() => navigate('/login')}
                className="btn btn-primary"
              >
                Go to Login
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="auth-header">
              <img src="/assets/xtown-light.png" alt="Xtown Authenticator" style={{ width: 60, height: 60, objectFit: 'contain', margin: '0 auto 1rem' }} />
              <h1 className="auth-title" style={{ color: '#000' }}>{step === 1 ? 'Super Admin Setup' : 'Verify Your Email'}</h1>
              <p className="auth-subtitle" style={{ color: '#000' }}>
                {step === 1 
                  ? 'Create the first and only Super Admin account' 
                  : 'Enter the verification code sent to your email'
                }
              </p>
            </div>

            {step === 1 ? (
              <form onSubmit={handleRegistration} className="space-y-6" style={{ width: '100%' }}>
                <div style={{ display: 'flex', gap: 16 }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label" style={{ color: '#000' }}>
                      <User className="form-label-icon" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Enter your full name"
                      required
                      style={{ background: '#fff', border: '1px solid #e2e8f0', color: '#000' }}
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
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
                </div>
                <div style={{ display: 'flex', gap: 16 }}>
                  
                  
                  <div className="form-group" style={{ flex: 1 }}>
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
                        className="form-input"
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
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label" style={{ color: '#000' }}>
                      <Lock className="form-label-icon" />
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="Confirm your password"
                        required
                        style={{ background: '#fff', border: '1px solid #e2e8f0', color: '#000' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="password-toggle"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 16 }}>
                <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label" style={{ color: '#000' }}>
                      <Building className="form-label-icon" />
                      Company Name
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Enter your company name"
                      required
                      style={{ background: '#fff', border: '1px solid #e2e8f0', color: '#000' }}
                    />
                  </div>
                  
                </div>
                {(error || message) && (
                  <div className={`alert ${error ? 'alert-error' : 'alert-info'}`}> 
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
                    boxShadow: '0 2px 8px rgba(64, 18, 178, 0.08)'
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="btn-icon spinner" />
                      Sending OTP...
                    </>
                  ) : (
                    'Send Verification Code'
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleOTPVerification} className="space-y-6" style={{ width: '100%', maxWidth: 540, margin: '0 auto' }}>
                <div className="text-center">
                  <div className="alert alert-info mb-6">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4012b2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg>
                    <div>
                      <p className="text-sm" style={{ color: '#000' }}>
                        We've sent a 6-digit verification code to
                        <br />
                        <strong>{formData.email}</strong>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="form-group" style={{ width: '100%' }}>
                  <label className="form-label text-center" style={{ color: '#000' }}>
                    Enter Verification Code
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
                    style={{ background: '#fff', border: '1px solid #e2e8f0', color: '#000', textAlign: 'center', fontSize: 24, letterSpacing: 8, width: '100%' }}
                  />
                </div>
                {(error || message) && (
                  <div className={`alert ${error ? 'alert-error' : 'alert-success'}`}> 
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
                  className="btn btn-success btn-full"
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
                      Verifying...
                    </>
                  ) : (
                    'Complete Setup'
                  )}
                </button>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={resendOTP}
                    disabled={isSubmitting}
                    className="btn-link text-sm"
                    style={{ color: '#000' }}
                  >
                    Didn't receive the code? Resend OTP
                  </button>
                </div>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="btn-link text-sm"
                    style={{ color: '#000' }}
                  >
                    ← Back to registration form
                  </button>
                </div>
              </form>
            )}
            <div className="mt-8 text-center">
              <p className="text-sm" style={{ color: '#000' }}>
                Already have an account?{' '}
                <button
                  onClick={() => navigate('/login')}
                  className="btn-link"
                  style={{ color: '#000' }}
                >
                  Sign in here
                </button>
              </p>
            </div>
          </>
        )}
      </div>
    </AuthSplitLayout>
  );
};

export default SuperAdminSetup; 