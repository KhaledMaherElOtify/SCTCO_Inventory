// Stock routes

import express from 'express';
import { body } from 'express-validator';
import {
  getProductStock,
  stockIn,
  stockOut,
  getTransactionHistory,
  getInventorySummary,
  getAllTransactions,
  adjustStockApi,
} from '../controllers/stockController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { auditMiddleware } from '../middleware/audit.js';

const router = express.Router();

// All stock routes require authentication
router.use(authenticateToken);
router.use(auditMiddleware);

// Get inventory summary (All users can view)
router.get('/summary', getInventorySummary);

// Get all transactions with filtering (All users can view)
router.get('/transactions/all', getAllTransactions);

// Get stock for specific product (All users can view)
router.get('/product/:productId', getProductStock);

// Get transaction history for product (All users can view)
router.get('/product/:productId/history', getTransactionHistory);

// Record stock in (Storekeeper and Admin)
router.post(
  '/in',
  requireRole('Admin', 'Storekeeper'),
  [
    body('product_id').notEmpty().withMessage('Product ID required'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  ],
  stockIn
);

// Record stock out (Storekeeper and Admin)
router.post(
  '/out',
  requireRole('Admin', 'Storekeeper'),
  [
    body('product_id').notEmpty().withMessage('Product ID required'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  ],
  stockOut
);

// Adjust stock (Admin only)
router.post(
  '/adjust',
  requireRole('Admin'),
  [
    body('product_id').notEmpty().withMessage('Product ID required'),
    body('new_quantity').isInt({ min: 0 }).withMessage('Quantity must be 0 or more'),
  ],
  adjustStockApi
);

export default router;
