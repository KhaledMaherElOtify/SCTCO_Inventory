// Product service
// Handles all product operations

import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../config/database.js';

export async function getAllProducts(filters = {}) {
  const db = getDatabase();
  let query = `
    SELECT 
      p.*, 
      c.name as category_name, 
      s.name as supplier_name,
      st.quantity_on_hand,
      st.quantity_available
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN suppliers s ON p.supplier_id = s.id
    LEFT JOIN stock st ON p.id = st.product_id
    WHERE p.is_active = 1
  `;
  const params = [];

  if (filters.category_id) {
    query += ' AND p.category_id = ?';
    params.push(filters.category_id);
  }

  if (filters.supplier_id) {
    query += ' AND p.supplier_id = ?';
    params.push(filters.supplier_id);
  }

  if (filters.search) {
    query += ' AND (p.name LIKE ? OR p.sku LIKE ?)';
    params.push(`%${filters.search}%`, `%${filters.search}%`);
  }

  query += ' ORDER BY p.name ASC';
  return db.all(query, params);
}

export async function getProductById(productId) {
  const db = getDatabase();
  return db.get(
    `SELECT 
      p.*, 
      c.name as category_name, 
      s.name as supplier_name,
      st.quantity_on_hand,
      st.quantity_available
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN suppliers s ON p.supplier_id = s.id
    LEFT JOIN stock st ON p.id = st.product_id
    WHERE p.id = ?`,
    [productId]
  );
}

export async function getProductBySku(sku) {
  const db = getDatabase();
  return db.get('SELECT * FROM products WHERE sku = ?', [sku]);
}

export async function createProduct(productData, userId) {
  const db = getDatabase();
  const id = uuidv4();
  await db.run(
    `INSERT INTO products 
      (id, sku, name, description, category_id, supplier_id, unit_cost, selling_price, reorder_level, reorder_quantity, unit_of_measure, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      productData.sku,
      productData.name,
      productData.description || '',
      productData.category_id,
      productData.supplier_id,
      productData.unit_cost,
      productData.selling_price,
      productData.reorder_level || 10,
      productData.reorder_quantity || 50,
      productData.unit_of_measure || 'pieces',
      userId,
    ]
  );

  // Initialize stock for the product
  const stockId = uuidv4();
  await db.run(
    'INSERT INTO stock (id, product_id, quantity_on_hand, quantity_available, last_updated_by) VALUES (?, ?, 0, 0, ?)',
    [stockId, id, userId]
  );

  return getProductById(id);
}

export async function updateProduct(productId, updates, userId) {
  const db = getDatabase();
  const allowedFields = [
    'name',
    'description',
    'category_id',
    'supplier_id',
    'unit_cost',
    'selling_price',
    'reorder_level',
    'reorder_quantity',
    'unit_of_measure',
  ];
  const fields = [];
  const values = [];

  for (const [key, value] of Object.entries(updates)) {
    if (allowedFields.includes(key)) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  }

  if (fields.length === 0) return getProductById(productId);

  values.push(productId);
  await db.run(`UPDATE products SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, values);

  return getProductById(productId);
}

export async function deactivateProduct(productId) {
  const db = getDatabase();
  await db.run('UPDATE products SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [productId]);
  return getProductById(productId);
}

export async function getProductsLowStock() {
  const db = getDatabase();
  return db.all(
    `SELECT 
      p.id, p.sku, p.name, p.reorder_level, 
      COALESCE(st.quantity_on_hand, 0) as quantity_on_hand,
      c.name as category_name
    FROM products p
    LEFT JOIN stock st ON p.id = st.product_id
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.is_active = 1 
      AND COALESCE(st.quantity_on_hand, 0) <= p.reorder_level
    ORDER BY quantity_on_hand ASC`
  );
}
