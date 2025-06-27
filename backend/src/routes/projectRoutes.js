import express from 'express';
import projectController from '../controllers/projectController.js';
import { createProjectValidation, handleValidationErrors } from '../utils/validators.js';
import { authenticate, requireSuperAdmin, verifyProjectAccess } from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Apply authentication and rate limiting to all routes
router.use(authenticate);
router.use(apiLimiter);

// Create new project (Super Admin only)
router.post('/',
  requireSuperAdmin,
  createProjectValidation,
  handleValidationErrors,
  projectController.createProject
);

// Get all projects (role-based access)
router.get('/',
  projectController.getProjects
);

// Get project statistics (Super Admin only)
router.get('/stats',
  requireSuperAdmin,
  projectController.getProjectStats
);

// Get single project details
router.get('/:customProjectId',
  verifyProjectAccess,
  projectController.getProject
);

// Update project (Super Admin only)
router.put('/:customProjectId',
  requireSuperAdmin,
  handleValidationErrors,
  projectController.updateProject
);

// Delete project (Super Admin only)
router.delete('/:customProjectId',
  requireSuperAdmin,
  projectController.deleteProject
);

export default router;
