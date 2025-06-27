import express from 'express';
import { createOrganization, getAllOrganizations } from '../controllers/organizationController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { authorizeRole } from '../middleware/authorizeRole.js';
import { validateOrganizationCreation } from '../middleware/validation.js';

const router = express.Router();

router.post('/', authenticateToken, authorizeRole('SUPER_ADMIN'), validateOrganizationCreation, createOrganization);
router.get('/', authenticateToken, authorizeRole('SUPER_ADMIN'), getAllOrganizations);

export default router;
