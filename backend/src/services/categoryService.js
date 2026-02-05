// Category service
// Handles product categories

import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../config/database.js';

export async function getAllCategories() {
  const db = getDatabase();
  return db.all('SELECT * FROM categories ORDER BY name ASC');
}

export async function getCategoryById(categoryId) {
  const db = getDatabase();
  return db.get('SELECT * FROM categories WHERE id = ?', [categoryId]);
}

export async function createCategory(name, description, userId) {
  const db = getDatabase();
  const id = uuidv4();
  await db.run(
    'INSERT INTO categories (id, name, description, created_by) VALUES (?, ?, ?, ?)',
    [id, name, description || '', userId]
  );
  return getCategoryById(id);
}

export async function updateCategory(categoryId, name, description) {
  const db = getDatabase();
  await db.run(
    'UPDATE categories SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [name, description || '', categoryId]
  );
  return getCategoryById(categoryId);
}

export async function deleteCategory(categoryId) {
  const db = getDatabase();
  await db.run('DELETE FROM categories WHERE id = ?', [categoryId]);
}
