import { body, validationResult } from 'express-validator';

// Validation error handler
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Super Admin registration validation
export const validateSuperAdminRegistration = [
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('organizationName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Organization name must be between 2 and 100 characters'),
  handleValidationErrors
];

// User creation validation (by Super Admin)
export const validateUserCreation = [
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('role')
    .isIn(['ADMIN', 'USER'])
    .withMessage('Role must be either ADMIN or USER'),
  body('organizationId')
    .optional()
    .isInt({ gt: 0 })
    .withMessage('Organization ID must be a positive integer'),
  body('projectIds')
    .optional()
    .isArray()
    .withMessage('Project IDs must be an array'),
  body('projectIds.*.id')
    .optional()
    .isInt({ gt: 0 })
    .withMessage('Each project ID must be a positive integer'),
  body('projectIds.*.role')
    .optional()
    .isIn(['OWNER', 'ADMIN', 'MEMBER', 'VIEWER'])
    .withMessage('Project role must be one of: OWNER, ADMIN, MEMBER, VIEWER'),
  handleValidationErrors
];

// User registration validation (legacy - for reference)
export const validateUserRegistration = [
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('role')
    .isIn(['SUPER_ADMIN', 'ADMIN', 'USER'])
    .withMessage('Role must be one of: SUPER_ADMIN, ADMIN, USER'),
  body('organizationId')
    .optional()
    .isInt({ gt: 0 })
    .withMessage('Organization ID must be a positive integer'),
  handleValidationErrors
];

// User login validation
export const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Organization creation validation
export const validateOrganizationCreation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Organization name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  handleValidationErrors
];

// Project creation validation
export const validateProjectCreation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Project name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('url')
    .optional()
    .isURL()
    .withMessage('URL must be a valid URL'),
  body('apiEndpoint')
    .optional()
    .isURL()
    .withMessage('API endpoint must be a valid URL'),
  body('organizationId')
    .isInt({ gt: 0 })
    .withMessage('Organization ID must be a positive integer'),
  handleValidationErrors
];

// Project update validation
export const validateProjectUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Project name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('url')
    .optional()
    .isURL()
    .withMessage('URL must be a valid URL'),
  body('apiEndpoint')
    .optional()
    .isURL()
    .withMessage('API endpoint must be a valid URL'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  handleValidationErrors
];

// Project assignment validation
export const validateProjectAssignment = [
  body('projectIds')
    .isArray({ min: 0 })
    .withMessage('Project IDs must be an array'),
  body('projectIds.*.id')
    .isInt({ gt: 0 })
    .withMessage('Each project ID must be a positive integer'),
  body('projectIds.*.role')
    .isIn(['OWNER', 'ADMIN', 'MEMBER', 'VIEWER'])
    .withMessage('Project role must be one of: OWNER, ADMIN, MEMBER, VIEWER'),
  handleValidationErrors
]; 