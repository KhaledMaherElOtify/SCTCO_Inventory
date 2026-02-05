// Authentication routes
// Login, logout, token refresh, profile

import express from 'express';
import { body } from 'express-validator';
import {
  login,
  logout,
  refreshAccessToken,
  getProfile,
  changePassword,
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Login endpoint
router.post(
  '/login',
  [
    body('username').trim().notEmpty().withMessage('Username required'),
    body('password').notEmpty().withMessage('Password required'),
  ],
  login
);

// Refresh token endpoint
router.post(
  '/refresh',
  [body('refreshToken').notEmpty().withMessage('Refresh token required')],
  refreshAccessToken
);

// Logout endpoint
router.post('/logout', authenticateToken, logout);

// Get current user profile
router.get('/profile', authenticateToken, getProfile);

// Change password
router.post(
  '/change-password',
  authenticateToken,
  [
    body('currentPassword').notEmpty().withMessage('Current password required'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters'),
  ],
  changePassword
);

export default router;
