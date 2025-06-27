import express from 'express';
import authController from '../controllers/authController.js';
import { 
  superAdminRegistrationValidation, 
  loginValidation, 
  forgotPasswordValidation, 
  resetPasswordValidation,
  otpValidation,
  handleValidationErrors 
} from '../utils/validators.js';
import { 
  authLimiter, 
  otpLimiter, 
  passwordResetLimiter,
  clearRateLimitData 
} from '../middleware/rateLimiter.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Development-only endpoint to clear rate limit data
if (process.env.NODE_ENV === 'development') {
  router.post('/clear-rate-limits', (req, res) => {
    clearRateLimitData();
    res.json({
      success: true,
      message: 'Rate limit data cleared successfully'
    });
  });
}

// Check if Super Admin exists
router.get('/check-super-admin', 
  authController.checkSuperAdminExists
);

// Super Admin Registration (Step 1: Send OTP)
router.post('/register', 
  authLimiter,
  superAdminRegistrationValidation,
  handleValidationErrors,
  authController.registerSuperAdmin
);

// Super Admin Registration (Step 2: Verify OTP and Complete Registration)
router.post('/verify-registration-otp',
  authLimiter,
  [...superAdminRegistrationValidation, ...otpValidation],
  handleValidationErrors,
  authController.verifySuperAdminOTP
);

// Account Activation for newly created users (Admin/Sub Users)
router.post('/activate-account',
  authLimiter,
  [
    ...forgotPasswordValidation, // Reuse email validation
    ...otpValidation // OTP validation
  ],
  handleValidationErrors,
  authController.activateAccount
);

// Send Account Activation OTP for existing users
router.post('/send-activation-otp',
  authLimiter,
  forgotPasswordValidation, // Reuse email validation
  handleValidationErrors,
  authController.sendActivationOTP
);

// Universal Login for all user types
router.post('/login',
  authLimiter,
  loginValidation,
  handleValidationErrors,
  authController.login
);

// Forgot Password (Send OTP)
router.post('/forgot-password',
  passwordResetLimiter,
  forgotPasswordValidation,
  handleValidationErrors,
  authController.forgotPassword
);

// Reset Password (Verify OTP and Update Password)
router.post('/reset-password',
  passwordResetLimiter,
  resetPasswordValidation,
  handleValidationErrors,
  authController.resetPassword
);

// Refresh Access Token
router.post('/refresh-token',
  authController.refreshToken
);

// Logout
router.post('/logout',
  authController.logout
);

// Validate Token (for external projects)
router.post('/validate-token',
  authController.validateToken
);

// Test endpoint to decode JWT token and show its contents (Development only)
if (process.env.NODE_ENV === 'development') {
  router.get('/decode-token',
    authenticate,
    authController.decodeToken
  );
}

// Generate Project-Specific Token for Redirection
router.post('/project-token/:customProjectId',
  authenticate,
  authController.generateProjectToken
);

// Redirect to Project with Token (for direct project access)
router.get('/redirect/:customProjectId',
  authenticate,
  authController.redirectToProject
);

export default router;
