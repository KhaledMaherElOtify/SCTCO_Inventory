// Category routes

import express from 'express';
import { body } from 'express-validator';
import {
  listCategories,
  getCategory,
  createNewCategory,
  updateCategoryInfo,
  deleteCategoryApi,
} from '../controllers/categoryController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { auditMiddleware } from '../middleware/audit.js';

const router = express.Router();

// All category routes require authentication
router.use(authenticateToken);
router.use(auditMiddleware);

// Get all categories (All users can read)
router.get('/', listCategories);

// Get specific category (All users can read)
router.get('/:id', getCategory);

// Create category (Storekeeper and Admin)
router.post(
  '/',
  requireRole('Admin', 'Storekeeper'),
  [body('name').trim().notEmpty().withMessage('Category name required')],
  createNewCategory
);

// Update category (Storekeeper and Admin)
router.put(
  '/:id',
  requireRole('Admin', 'Storekeeper'),
  [body('name').trim().notEmpty().withMessage('Category name required')],
  updateCategoryInfo
);

// Delete category (Admin only)
router.delete('/:id', requireRole('Admin'), deleteCategoryApi);

export default router;
