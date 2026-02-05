// Standalone database initialization script
// Run with: node src/init-db-standalone.js

import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function initDb() {
  try {
    console.log('Initializing database...');

    // Open database
    const db = await open({
      filename: path.join(__dirname, '../data/inventory.db'),
      driver: sqlite3.Database,
    });

    // Enable foreign keys
    await db.exec('PRAGMA foreign_keys = ON');
    await db.exec('PRAGMA journal_mode = WAL');

    // Read and execute schema
    const schemaPath = path.join(__dirname, '../sql/schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');

    const statements = schemaSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'));

    for (const statement of statements) {
      try {
        await db.exec(statement);
      } catch (err) {
        if (!err.message.includes('already exists')) {
          console.warn('Warning:', err.message);
        }
      }
    }

    console.log('✓ Schema created');

    // Check if users exist
    const userCount = await db.get('SELECT COUNT(*) as count FROM users');
    if (userCount && userCount.count > 0) {
      console.log('✓ Database already seeded, skipping...');
      await db.close();
      return;
    }

    // Seed default users
    const adminPassword = await bcrypt.hash('admin123', 10);
    await db.run(
      `INSERT INTO users (username, email, password_hash, role, full_name)
       VALUES (?, ?, ?, ?, ?)`,
      ['admin', 'admin@localhost', adminPassword, 'Admin', 'Administrator']
    );

    const storekeeperPassword = await bcrypt.hash('store123', 10);
    await db.run(
      `INSERT INTO users (username, email, password_hash, role, full_name)
       VALUES (?, ?, ?, ?, ?)`,
      ['storekeeper', 'store@localhost', storekeeperPassword, 'Storekeeper', 'Store Keeper']
    );

    const viewerPassword = await bcrypt.hash('view123', 10);
    await db.run(
      `INSERT INTO users (username, email, password_hash, role, full_name)
       VALUES (?, ?, ?, ?, ?)`,
      ['viewer', 'viewer@localhost', viewerPassword, 'Viewer', 'Viewer User']
    );

    console.log('✓ Default users seeded');
    console.log('\nDefault credentials:');
    console.log('  - Admin: admin / admin123');
    console.log('  - Storekeeper: storekeeper / store123');
    console.log('  - Viewer: viewer / view123');

    await db.close();
    console.log('\n✓ Database initialization complete!');
  } catch (error) {
    console.error('✗ Database initialization failed:', error.message);
    process.exit(1);
  }
}

initDb();
