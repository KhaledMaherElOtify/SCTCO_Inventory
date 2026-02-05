// Stock service
// Handles stock transactions and inventory calculations

import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../config/database.js';

export async function getStockByProductId(productId) {
  const db = getDatabase();
  return db.get('SELECT * FROM stock WHERE product_id = ?', [productId]);
}

export async function recordStockTransaction(productId, type, quantity, referenceNumber, notes, userId) {
  const db = getDatabase();

  // Use transaction for consistency
  try {
    await db.exec('BEGIN TRANSACTION');

    // Record transaction
    const transactionId = uuidv4();
    await db.run(
      `INSERT INTO stock_transactions (id, product_id, transaction_type, quantity, reference_number, notes, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [transactionId, productId, type, quantity, referenceNumber || '', notes || '', userId]
    );

    // Update stock levels based on transaction type
    let quantityChange = quantity;
    if (type === 'Stock Out' || type === 'Return') {
      quantityChange = -quantity;
    }

    await db.run(
      `UPDATE stock 
       SET quantity_on_hand = quantity_on_hand + ?,
           quantity_available = quantity_on_hand + ? - quantity_reserved,
           last_updated = CURRENT_TIMESTAMP,
           last_updated_by = ?
       WHERE product_id = ?`,
      [quantityChange, quantityChange, userId, productId]
    );

    await db.exec('COMMIT');
    return { id: transactionId };
  } catch (error) {
    await db.exec('ROLLBACK');
    throw error;
  }
}

export async function getStockTransactionHistory(productId, limit = 50, offset = 0) {
  const db = getDatabase();
  return db.all(
    `SELECT 
      st.*, 
      u.username as created_by_name
    FROM stock_transactions st
    LEFT JOIN users u ON st.created_by = u.id
    WHERE st.product_id = ?
    ORDER BY st.created_at DESC
    LIMIT ? OFFSET ?`,
    [productId, limit, offset]
  );
}

export async function getStockSummary() {
  const db = getDatabase();
  return db.all(
    `SELECT 
      s.id,
      p.id as product_id,
      p.sku,
      p.name,
      c.name as category_name,
      p.unit_cost,
      p.selling_price,
      p.reorder_level,
      COALESCE(s.quantity_on_hand, 0) as quantity_on_hand,
      COALESCE(s.quantity_available, 0) as quantity_available,
      COALESCE(s.quantity_reserved, 0) as quantity_reserved,
      s.last_updated,
      CASE 
        WHEN COALESCE(s.quantity_on_hand, 0) <= p.reorder_level THEN 'Low'
        ELSE 'OK'
      END as status
    FROM products p
    LEFT JOIN stock s ON p.id = s.product_id
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.is_active = 1
    ORDER BY p.name ASC`
  );
}

export async function getAllTransactionHistory(startDate = null, endDate = null, limit = 100, offset = 0) {
  const db = getDatabase();
  let query = `
    SELECT 
      st.id,
      st.product_id,
      p.sku,
      p.name as product_name,
      st.transaction_type,
      st.quantity,
      st.reference_number,
      st.notes,
      st.created_at,
      u.username as created_by
    FROM stock_transactions st
    LEFT JOIN products p ON st.product_id = p.id
    LEFT JOIN users u ON st.created_by = u.id
    WHERE 1=1
  `;
  const params = [];

  if (startDate) {
    query += ' AND DATE(st.created_at) >= DATE(?)';
    params.push(startDate);
  }

  if (endDate) {
    query += ' AND DATE(st.created_at) <= DATE(?)';
    params.push(endDate);
  }

  query += ' ORDER BY st.created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  return db.all(query, params);
}

export async function adjustStock(productId, newQuantity, notes, userId) {
  const db = getDatabase();

  try {
    const stock = await getStockByProductId(productId);
    if (!stock) {
      throw new Error('Product stock not found');
    }

    const currentQuantity = stock.quantity_on_hand;
    const difference = newQuantity - currentQuantity;

    if (difference !== 0) {
      const type = difference > 0 ? 'Stock In' : 'Stock Out';
      const adjustmentQty = Math.abs(difference);

      await recordStockTransaction(productId, 'Adjustment', adjustmentQty, '', notes || 'Stock adjustment', userId);
    }

    return getStockByProductId(productId);
  } catch (error) {
    throw error;
  }
}
