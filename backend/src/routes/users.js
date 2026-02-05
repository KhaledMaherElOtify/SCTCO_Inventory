// User management routes
// Admin endpoints for managing users

import express from 'express';
import { body } from 'express-validator';
import {
  listUsers,
  getUser,
  createNewUser,
  updateUserInfo,
  deactivateUserAccount,
  deleteUserAccount,
} from '../controllers/userController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { auditMiddleware } from '../middleware/audit.js';

const router = express.Router();

// All user routes require authentication and admin role
router.use(authenticateToken, requireRole('Admin'));
router.use(auditMiddleware);

// List all users
router.get('/', listUsers);

// Get specific user
router.get('/:id', getUser);

// Create new user
router.post(
  '/',
  [
    body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('email').isEmail().withMessage('Invalid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['Admin', 'Storekeeper', 'Viewer']).withMessage('Invalid role'),
    body('full_name').trim().notEmpty().withMessage('Full name required'),
  ],
  createNewUser
);

// Update user
router.put(
  '/:id',
  [
    body('email').optional().isEmail().withMessage('Invalid email'),
    body('role').optional().isIn(['Admin', 'Storekeeper', 'Viewer']).withMessage('Invalid role'),
    body('full_name').optional().trim().notEmpty().withMessage('Full name required'),
  ],
  updateUserInfo
);

// Deactivate user
router.post('/:id/deactivate', deactivateUserAccount);

// Delete user
router.delete('/:id', deleteUserAccount);

export default router;
