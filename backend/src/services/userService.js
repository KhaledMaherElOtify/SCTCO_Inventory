// User service
// Handles user operations and queries

import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../config/database.js';

export async function getUserById(userId) {
  const db = getDatabase();
  return db.get('SELECT id, username, email, role, full_name, is_active, created_at FROM users WHERE id = ?', [userId]);
}

export async function getUserByUsername(username) {
  const db = getDatabase();
  return db.get('SELECT * FROM users WHERE username = ?', [username]);
}

export async function getUserByEmail(email) {
  const db = getDatabase();
  return db.get('SELECT * FROM users WHERE email = ?', [email]);
}

export async function getAllUsers() {
  const db = getDatabase();
  return db.all(
    'SELECT id, username, email, role, full_name, is_active, created_at, updated_at FROM users ORDER BY created_at DESC'
  );
}

export async function createUser(username, email, passwordHash, role, fullName) {
  const db = getDatabase();
  const id = uuidv4();
  await db.run(
    `INSERT INTO users (id, username, email, password_hash, role, full_name, is_active)
     VALUES (?, ?, ?, ?, ?, ?, 1)`,
    [id, username, email, passwordHash, role, fullName]
  );
  return getUserById(id);
}

export async function updateUser(userId, updates) {
  const db = getDatabase();
  const allowedFields = ['email', 'role', 'full_name', 'is_active'];
  const fields = [];
  const values = [];

  for (const [key, value] of Object.entries(updates)) {
    if (allowedFields.includes(key)) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  }

  if (fields.length === 0) return null;

  values.push(userId);
  await db.run(
    `UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    values
  );

  return getUserById(userId);
}

export async function deactivateUser(userId) {
  const db = getDatabase();
  await db.run('UPDATE users SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [userId]);
  return getUserById(userId);
}

export async function updateUserPassword(userId, newPasswordHash) {
  const db = getDatabase();
  await db.run(
    'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [newPasswordHash, userId]
  );
  return getUserById(userId);
}

export async function deleteUser(userId) {
  const db = getDatabase();
  await db.run('DELETE FROM users WHERE id = ?', [userId]);
}
