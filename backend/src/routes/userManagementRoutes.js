import express from 'express';
import userManagementController from '../controllers/userManagementController.js';
import { 
  createUserValidation, 
  createSubUserValidation, 
  handleValidationErrors 
} from '../utils/validators.js';
import { 
  authenticate, 
  requireSuperAdmin, 
  requireProjectAdmin,
  checkSubUserLimit 
} from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Apply authentication and rate limiting to all routes
router.use(authenticate);
router.use(apiLimiter);

// Create Project Admin (Super Admin only)
router.post('/project-admin',
  requireSuperAdmin,
  createUserValidation,
  handleValidationErrors,
  userManagementController.createProjectAdmin
);

// Create Sub User (Project Admin only)
router.post('/sub-user',
  requireProjectAdmin,
  checkSubUserLimit,
  createSubUserValidation,
  handleValidationErrors,
  userManagementController.createSubUser
);

// Get all users (role-based access)
router.get('/',
  userManagementController.getUsers
);

// Get user statistics (Super Admin only)
router.get('/stats',
  requireSuperAdmin,
  userManagementController.getUserStats
);

// Suspend user (Super Admin or Project Admin for their subusers)
router.post('/:userId/suspend',
  requireProjectAdmin,
  userManagementController.suspendUser
);

// Unsuspend user (Super Admin or Project Admin for their subusers)
router.post('/:userId/unsuspend',
  requireProjectAdmin,
  userManagementController.unsuspendUser
);

// Update user project assignments
router.put('/:userId/projects',
  requireSuperAdmin,
  handleValidationErrors,
  userManagementController.updateUserProjects
);

// Get single user details
router.get('/:userId',
  userManagementController.getUser
);

// Update user
router.put('/:userId',
  handleValidationErrors,
  userManagementController.updateUser
);

// Delete user
router.delete('/:userId',
  userManagementController.deleteUser
);

export default router; 