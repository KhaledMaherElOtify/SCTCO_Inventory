// Stock controller
// Handles stock transactions and inventory operations

import { validationResult } from 'express-validator';
import {
  getStockByProductId,
  recordStockTransaction,
  getStockTransactionHistory,
  getStockSummary,
  getAllTransactionHistory,
  adjustStock,
} from '../services/stockService.js';
import { getProductById } from '../services/productService.js';

export async function getProductStock(req, res) {
  try {
    const stock = await getStockByProductId(req.params.productId);
    if (!stock) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(stock);
  } catch (error) {
    console.error('Get stock error:', error);
    res.status(500).json({ error: 'Failed to get stock' });
  }
}

export async function stockIn(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array(),
    });
  }

  try {
    const product = await getProductById(req.body.product_id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const transaction = await recordStockTransaction(
      req.body.product_id,
      'Stock In',
      req.body.quantity,
      req.body.reference_number,
      req.body.notes,
      req.user.id
    );

    // Audit
    req.audit('STOCK_IN', 'Stock', req.body.product_id, null, {
      quantity: req.body.quantity,
      reference: req.body.reference_number,
    });

    res.status(201).json({
      success: true,
      message: `Added ${req.body.quantity} units of ${product.name}`,
      transaction,
    });
  } catch (error) {
    console.error('Stock in error:', error);
    res.status(500).json({ error: 'Failed to record stock in' });
  }
}

export async function stockOut(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array(),
    });
  }

  try {
    const product = await getProductById(req.body.product_id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if enough stock available
    const stock = await getStockByProductId(req.body.product_id);
    if (stock && stock.quantity_available < req.body.quantity) {
      return res.status(400).json({
        error: 'Insufficient stock',
        available: stock.quantity_available,
        requested: req.body.quantity,
      });
    }

    const transaction = await recordStockTransaction(
      req.body.product_id,
      'Stock Out',
      req.body.quantity,
      req.body.reference_number,
      req.body.notes,
      req.user.id
    );

    // Audit
    req.audit('STOCK_OUT', 'Stock', req.body.product_id, null, {
      quantity: req.body.quantity,
      reference: req.body.reference_number,
    });

    res.status(201).json({
      success: true,
      message: `Removed ${req.body.quantity} units of ${product.name}`,
      transaction,
    });
  } catch (error) {
    console.error('Stock out error:', error);
    res.status(500).json({ error: 'Failed to record stock out' });
  }
}

export async function getTransactionHistory(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const transactions = await getStockTransactionHistory(req.params.productId, limit, offset);
    res.json(transactions);
  } catch (error) {
    console.error('Get transaction history error:', error);
    res.status(500).json({ error: 'Failed to get transaction history' });
  }
}

export async function getInventorySummary(req, res) {
  try {
    const summary = await getStockSummary();
    res.json(summary || []);
  } catch (error) {
    console.error('Get inventory summary error:', error);
    res.status(500).json({ error: 'Failed to get inventory summary' });
  }
}

export async function getAllTransactions(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;
    const startDate = req.query.start_date;
    const endDate = req.query.end_date;

    const transactions = await getAllTransactionHistory(startDate, endDate, limit, offset);
    res.json(transactions || []);
  } catch (error) {
    console.error('Get all transactions error:', error);
    res.status(500).json({ error: 'Failed to get transactions' });
  }
}

export async function adjustStockApi(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array(),
    });
  }

  try {
    const product = await getProductById(req.body.product_id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const stock = await adjustStock(req.body.product_id, req.body.new_quantity, req.body.notes, req.user.id);

    // Audit
    req.audit('ADJUST_STOCK', 'Stock', req.body.product_id, null, {
      old_quantity: product.quantity_on_hand,
      new_quantity: req.body.new_quantity,
    });

    res.json({
      success: true,
      message: `Stock adjusted to ${req.body.new_quantity}`,
      stock,
    });
  } catch (error) {
    console.error('Adjust stock error:', error);
    res.status(500).json({ error: 'Failed to adjust stock' });
  }
}
