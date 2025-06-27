import { body, validationResult } from 'express-validator';

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  // At least 8 characters, contains letters and numbers
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
  return passwordRegex.test(password);
};

export const validateCustomProjectId = (customProjectId) => {
  // Only alphanumeric characters, hyphens, and underscores, 3-20 characters
  const projectIdRegex = /^[a-zA-Z0-9_-]{3,20}$/;
  return projectIdRegex.test(customProjectId);
};

export const superAdminRegistrationValidation = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
    .withMessage('Password must contain at least one letter and one number'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
  
  body('companyName')
    .notEmpty()
    .withMessage('Company name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters'),
];

export const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

export const otpValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email'),
  
  body('otp')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('OTP must be a 6-digit number'),
];

export const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email'),
];

export const resetPasswordValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email'),
  
  body('otp')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('OTP must be a 6-digit number'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
    .withMessage('Password must contain at least one letter and one number'),
];

export const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const validatePhoneNumber = (phone) => {
  if (!phone) return true;
  return /^[\d\s\-\+\(\)]+$/.test(phone) && phone.length >= 5 && phone.length <= 20;
};

export const validateCountryCode = (code) => {
  if (!code) return true;
  return /^\+\d{1,4}$/.test(code);
};

export const createProjectValidation = [
  body('customProjectId')
    .notEmpty()
    .withMessage('Project ID is required')
    .trim()
    .matches(/^[a-zA-Z0-9_-]{3,20}$/)
    .withMessage('Project ID must be 3-20 characters long and contain only letters, numbers, hyphens, and underscores'),
  
  body('name')
    .notEmpty()
    .withMessage('Project name is required')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Project name must be between 2 and 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  
  body('projectUrl')
    .notEmpty()
    .withMessage('Project URL is required')
    .trim()
    .custom((value) => {
      if (!validateUrl(value)) {
        throw new Error('Please provide a valid URL including protocol (http:// or https://)');
      }
      return true;
    }),
  
  body('icon')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Icon field cannot exceed 100 characters'),
];

export const createUserValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['ADMIN', 'USER'])
    .withMessage('Invalid role'),
  body('companyName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters'),
  body('companyAddress')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Company address must be between 5 and 200 characters'),
  body('companyPhone')
    .optional()
    .trim()
    .matches(/^[0-9]{10,15}$/)
    .withMessage('Invalid phone number format'),
  body('countryCode')
    .optional()
    .trim()
    .matches(/^\+\d{1,4}$/)
    .withMessage('Invalid country code format'),
  body('subUserLimit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Sub-user limit must be between 1 and 100'),
  body('projectAssignments')
    .isArray()
    .withMessage('Project assignments must be an array'),
  body('projectAssignments.*.projectId')
    .isInt({ min: 1 })
    .withMessage('Invalid project ID')
];

export const createSubUserValidation = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
    .withMessage('Password must contain at least one letter and one number'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
  
  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Role must be between 2 and 50 characters'),
  
  body('projectAssignments')
    .isArray({ min: 1 })
    .withMessage('At least one project assignment must be provided'),
  
  body('projectAssignments.*.projectId')
    .isInt({ gt: 0 })
    .withMessage('Project ID must be a positive integer'),
  
  body('projectAssignments.*.projectUrl')
    .optional()
    .custom((value) => {
      // If value is empty or null, it's valid (optional)
      if (!value || value.trim() === '') {
        return true;
      }
      // If value exists, it must be a valid URL
      try {
        new URL(value);
        return true;
      } catch {
        throw new Error('Project URL must be a valid URL');
      }
    }),
];

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('❌ Validation failed for request:', {
      url: req.url,
      method: req.method,
      body: JSON.stringify(req.body, null, 2),
      errors: errors.array()
    });
    
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      })),
    });
  }
  next();
};

// Validate project assignments
const validateProjectAssignments = (projectAssignments) => {
  if (!Array.isArray(projectAssignments)) {
    throw new Error('Project assignments must be an array');
  }

  for (const assignment of projectAssignments) {
    if (!assignment.projectId || typeof assignment.projectId !== 'number') {
      throw new Error('Each project assignment must have a valid projectId');
    }
  }

  return true;
}; 