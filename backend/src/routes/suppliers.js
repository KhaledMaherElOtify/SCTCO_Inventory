// Supplier routes

import express from 'express';
import { body } from 'express-validator';
import {
  listSuppliers,
  getSupplier,
  createNewSupplier,
  updateSupplierInfo,
  deleteSupplierApi,
} from '../controllers/supplierController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { auditMiddleware } from '../middleware/audit.js';

const router = express.Router();

// All supplier routes require authentication
router.use(authenticateToken);
router.use(auditMiddleware);

// Get all suppliers (All users can read)
router.get('/', listSuppliers);

// Get specific supplier (All users can read)
router.get('/:id', getSupplier);

// Create supplier (Storekeeper and Admin)
router.post(
  '/',
  requireRole('Admin', 'Storekeeper'),
  [body('name').trim().notEmpty().withMessage('Supplier name required')],
  createNewSupplier
);

// Update supplier (Storekeeper and Admin)
router.put(
  '/:id',
  requireRole('Admin', 'Storekeeper'),
  [body('name').trim().notEmpty().withMessage('Supplier name required')],
  updateSupplierInfo
);

// Delete supplier (Admin only)
router.delete('/:id', requireRole('Admin'), deleteSupplierApi);

export default router;
