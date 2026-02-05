// Utility to initialize database schema on first run
// Reads and executes schema.sql

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDatabase } from '../config/database.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function initializeSchema() {
  const db = getDatabase();
  
  try {
    const schemaPath = path.join(__dirname, '../../sql/schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
    
    // Split into individual statements and execute
    const statements = schemaSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'));

    for (const statement of statements) {
      await db.exec(statement);
    }

    console.log('✓ Database schema initialized');
  } catch (error) {
    console.error('✗ Schema initialization failed:', error.message);
    throw error;
  }
}

export async function seedInitialData() {
  const db = getDatabase();
  
  try {
    // Check if users already exist
    const userCount = await db.get('SELECT COUNT(*) as count FROM users');
    if (userCount.count > 0) {
      console.log('✓ Database already seeded, skipping...');
      return;
    }

    // Import here to avoid circular dependencies
    const bcrypt = await import('bcryptjs');
    
    // Create default admin user
    const adminPassword = await bcrypt.default.hash('admin123', 10);
    await db.run(
      `INSERT INTO users (username, email, password_hash, role, full_name)
       VALUES (?, ?, ?, ?, ?)`,
      ['admin', 'admin@localhost', adminPassword, 'Admin', 'Administrator']
    );

    // Create default storekeeper user
    const storekeeperPassword = await bcrypt.default.hash('store123', 10);
    await db.run(
      `INSERT INTO users (username, email, password_hash, role, full_name)
       VALUES (?, ?, ?, ?, ?)`,
      ['storekeeper', 'store@localhost', storekeeperPassword, 'Storekeeper', 'Store Keeper']
    );

    // Create default viewer user
    const viewerPassword = await bcrypt.default.hash('view123', 10);
    await db.run(
      `INSERT INTO users (username, email, password_hash, role, full_name)
       VALUES (?, ?, ?, ?, ?)`,
      ['viewer', 'viewer@localhost', viewerPassword, 'Viewer', 'Viewer User']
    );

    console.log('✓ Initial data seeded');
    console.log('  Default credentials:');
    console.log('  - Admin: admin / admin123');
    console.log('  - Storekeeper: storekeeper / store123');
    console.log('  - Viewer: viewer / view123');
  } catch (error) {
    console.error('✗ Seed failed:', error.message);
    throw error;
  }
}
