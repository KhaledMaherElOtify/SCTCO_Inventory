// Product routes

import express from 'express';
import { body } from 'express-validator';
import {
  listProducts,
  getProduct,
  createNewProduct,
  updateProductInfo,
  deactivateProductApi,
  lowStockProducts,
} from '../controllers/productController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { auditMiddleware } from '../middleware/audit.js';

const router = express.Router();

// All product routes require authentication
router.use(authenticateToken);
router.use(auditMiddleware);

// Get all products (Viewers can read)
router.get('/', listProducts);

// Get low stock products
router.get('/low-stock', lowStockProducts);

// Get specific product
router.get('/:id', getProduct);

// Create product (Storekeeper and Admin)
router.post(
  '/',
  requireRole('Admin', 'Storekeeper'),
  [
    body('sku').trim().notEmpty().withMessage('SKU required'),
    body('name').trim().notEmpty().withMessage('Product name required'),
    body('category_id').notEmpty().withMessage('Category required'),
    body('supplier_id').notEmpty().withMessage('Supplier required'),
    body('unit_cost').isFloat({ min: 0 }).withMessage('Valid unit cost required'),
    body('selling_price').isFloat({ min: 0 }).withMessage('Valid selling price required'),
  ],
  createNewProduct
);

// Update product (Storekeeper and Admin)
router.put(
  '/:id',
  requireRole('Admin', 'Storekeeper'),
  [
    body('name').optional().trim().notEmpty().withMessage('Product name required'),
    body('unit_cost').optional().isFloat({ min: 0 }).withMessage('Valid unit cost required'),
    body('selling_price').optional().isFloat({ min: 0 }).withMessage('Valid selling price required'),
  ],
  updateProductInfo
);

// Deactivate product (Admin only)
router.post('/:id/deactivate', requireRole('Admin'), deactivateProductApi);

export default router;
