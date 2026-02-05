// Product controller
// Handles product API endpoints

import { validationResult } from 'express-validator';
import {
  getAllProducts,
  getProductById,
  getProductBySku,
  createProduct,
  updateProduct,
  deactivateProduct,
  getProductsLowStock,
} from '../services/productService.js';

export async function listProducts(req, res) {
  try {
    const filters = {
      category_id: req.query.category_id,
      supplier_id: req.query.supplier_id,
      search: req.query.search,
    };
    const products = await getAllProducts(filters);
    res.json(products);
  } catch (error) {
    console.error('List products error:', error);
    res.status(500).json({ error: 'Failed to list products' });
  }
}

export async function getProduct(req, res) {
  try {
    const product = await getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Failed to get product' });
  }
}

export async function createNewProduct(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array(),
    });
  }

  try {
    // Check SKU uniqueness
    const existing = await getProductBySku(req.body.sku);
    if (existing) {
      return res.status(409).json({ error: 'SKU already exists' });
    }

    const product = await createProduct(req.body, req.user.id);

    // Audit
    req.audit('CREATE', 'Product', product.id, null, {
      sku: product.sku,
      name: product.name,
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error.message, 'User ID:', req.user?.id, 'Body:', req.body);
    if (error.message.includes('FOREIGN KEY')) {
      return res.status(400).json({ error: 'Invalid category, supplier, or user reference' });
    }
    res.status(500).json({ error: 'Failed to create product' });
  }
}

export async function updateProductInfo(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array(),
    });
  }

  try {
    const oldProduct = await getProductById(req.params.id);
    if (!oldProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = await updateProduct(req.params.id, req.body, req.user.id);

    // Audit
    req.audit('UPDATE', 'Product', req.params.id, oldProduct, req.body);

    res.json(product);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
}

export async function deactivateProductApi(req, res) {
  try {
    const product = await getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const deactivated = await deactivateProduct(req.params.id);

    // Audit
    req.audit('DEACTIVATE', 'Product', req.params.id, { is_active: true }, { is_active: false });

    res.json(deactivated);
  } catch (error) {
    console.error('Deactivate product error:', error);
    res.status(500).json({ error: 'Failed to deactivate product' });
  }
}

export async function lowStockProducts(req, res) {
  try {
    const products = await getProductsLowStock();
    res.json(products);
  } catch (error) {
    console.error('Low stock products error:', error);
    res.status(500).json({ error: 'Failed to get low stock products' });
  }
}
