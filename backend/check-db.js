#!/usr/bin/env node

import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'data/inventory.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database error:', err.message);
    process.exit(1);
  }

  console.log('\n=== USERS ===');
  db.all('SELECT id, username, email, role FROM users', (err, users) => {
    if (err) {
      console.error('Users query error:', err.message);
    } else {
      users.forEach(u => console.log(`${u.id} | ${u.username} | ${u.email} | ${u.role}`));
    }

    console.log('\n=== PRODUCTS ===');
    db.all('SELECT id, sku, name, created_by FROM products LIMIT 5', (err, products) => {
      if (err) {
        console.error('Products query error:', err.message);
      } else if (products.length === 0) {
        console.log('No products found');
      } else {
        products.forEach(p => console.log(`${p.id} | ${p.sku} | ${p.name} | Created by: ${p.created_by}`));
      }

      console.log('\n=== STOCK ===');
      db.all('SELECT id, product_id FROM stock LIMIT 5', (err, stock) => {
        if (err) {
          console.error('Stock query error:', err.message);
        } else if (stock.length === 0) {
          console.log('No stock records found');
        } else {
          stock.forEach(s => console.log(`${s.id} | Product: ${s.product_id}`));
        }

        db.close();
        process.exit(0);
      });
    });
  });
});
