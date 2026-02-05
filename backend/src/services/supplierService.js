// Supplier service
// Handles supplier management

import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../config/database.js';

export async function getAllSuppliers() {
  const db = getDatabase();
  return db.all('SELECT * FROM suppliers ORDER BY name ASC');
}

export async function getSupplierById(supplierId) {
  const db = getDatabase();
  return db.get('SELECT * FROM suppliers WHERE id = ?', [supplierId]);
}

export async function createSupplier(supplierData, userId) {
  const db = getDatabase();
  const id = uuidv4();
  await db.run(
    `INSERT INTO suppliers (id, name, contact_person, email, phone, address, city, country, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      supplierData.name,
      supplierData.contact_person || '',
      supplierData.email || '',
      supplierData.phone || '',
      supplierData.address || '',
      supplierData.city || '',
      supplierData.country || '',
      userId,
    ]
  );
  return getSupplierById(id);
}

export async function updateSupplier(supplierId, updates) {
  const db = getDatabase();
  const allowedFields = ['name', 'contact_person', 'email', 'phone', 'address', 'city', 'country'];
  const fields = [];
  const values = [];

  for (const [key, value] of Object.entries(updates)) {
    if (allowedFields.includes(key)) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  }

  if (fields.length === 0) return getSupplierById(supplierId);

  values.push(supplierId);
  await db.run(`UPDATE suppliers SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, values);

  return getSupplierById(supplierId);
}

export async function deleteSupplier(supplierId) {
  const db = getDatabase();
  await db.run('DELETE FROM suppliers WHERE id = ?', [supplierId]);
}
