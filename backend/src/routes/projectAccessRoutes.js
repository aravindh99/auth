import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { 
  generateProjectAccessToken, 
  redirectToProject, 
  verifyProjectAccess,
  validateJWTToken,
  checkProjectAccess
} from '../controllers/projectAccessController.js';

const router = express.Router();

// Protected routes (require authentication)
router.post('/project/:projectId/token', authenticateToken, generateProjectAccessToken);
router.get('/project/:projectId/redirect', authenticateToken, redirectToProject);
router.get('/project/:projectId/verify', authenticateToken, verifyProjectAccess);

// Public routes for individual project backends to validate tokens
router.post('/validate-token', validateJWTToken);
router.get('/check-access/:projectId', checkProjectAccess);

export default router; 