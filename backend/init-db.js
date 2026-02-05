#!/usr/bin/env node

import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function runSQL(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    if (params.length > 0) {
      db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    } else {
      db.exec(sql, (err) => {
        if (err) reject(err);
        else resolve();
      });
    }
  });
}

function querySQL(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

async function initDatabase() {
  return new Promise((resolve, reject) => {
    const dbPath = path.join(__dirname, 'data/inventory.db');
    const dataDir = path.dirname(dbPath);
    
    // Create data directory if it doesn't exist
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const db = new sqlite3.Database(dbPath, async (err) => {
      if (err) {
        console.error('✗ Failed to open database:', err.message);
        reject(err);
        return;
      }

      console.log('✓ Database opened');

      try {
        // Set pragmas
        await runSQL(db, 'PRAGMA foreign_keys = OFF');
        await runSQL(db, 'PRAGMA journal_mode = WAL');

        console.log('✓ Pragmas configured\n');

        // Read schema file
        const schemaPath = path.join(__dirname, 'sql/schema.sql');
        if (!fs.existsSync(schemaPath)) {
          throw new Error(`Schema file not found: ${schemaPath}`);
        }

        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        // Parse individual statements
        // Split by semicolon and keep statements that have actual content
        const allParts = schemaSql.split(';');
        const statements = [];

        for (const part of allParts) {
          let stmt = part.trim();
          if (!stmt) continue;

          // Remove leading comments from this statement
          while (stmt.startsWith('--')) {
            const newlineIdx = stmt.indexOf('\n');
            if (newlineIdx === -1) break;
            stmt = stmt.substring(newlineIdx + 1).trim();
          }

          // Remove trailing comments
          stmt = stmt.replace(/--[^\n]*$/gm, '').trim();

          if (stmt) {
            statements.push(stmt);
          }
        }

        console.log(`Executing ${statements.length} SQL statements...\n`);

        for (let i = 0; i < statements.length; i++) {
          const stmt = statements[i];
          try {
            console.log(`[${String(i + 1).padStart(2)}] Executing: ${stmt.substring(0, 60).replace(/\n/g, ' ')}...`);
            await runSQL(db, stmt);
            const preview = stmt
              .split('\n')[0]
              .substring(0, 70)
              .replace(/\s+/g, ' ');
            console.log(`[${String(i + 1).padStart(2)}] ✓ ${preview}`);
          } catch (err) {
            if (err.message.includes('already exists')) {
              console.log(
                `[${String(i + 1).padStart(2)}] ⊘ Already exists`
              );
            } else {
              console.error(
                `[${String(i + 1).padStart(2)}] ✗ Statement: ${stmt.substring(0, 80)}`
              );
              console.error(
                `[${String(i + 1).padStart(2)}] ✗ Error: ${err.message}`
              );
              throw err;
            }
          }
        }

        console.log('\n✓ Schema created successfully\n');

        // Enable foreign keys
        await runSQL(db, 'PRAGMA foreign_keys = ON');

        // Check for existing users
        const users = await querySQL(
          db,
          'SELECT COUNT(*) as count FROM users'
        );

        if (users[0].count > 0) {
          console.log('✓ Users table already seeded, skipping...\n');
          db.close();
          resolve();
          return;
        }

        // Seed users
        console.log('Seeding default users...\n');

        const adminHash = await bcrypt.hash('admin123', 10);
        const storekeeperHash = await bcrypt.hash('store123', 10);
        const viewerHash = await bcrypt.hash('view123', 10);

        await runSQL(db, 
          `INSERT INTO users (id, username, email, password_hash, role, full_name, is_active)
           VALUES (?, ?, ?, ?, ?, ?, 1)`,
          ['admin-001', 'admin', 'admin@localhost', adminHash, 'Admin', 'Administrator']
        );
        console.log('✓ Admin user created');

        await runSQL(db, 
          `INSERT INTO users (id, username, email, password_hash, role, full_name, is_active)
           VALUES (?, ?, ?, ?, ?, ?, 1)`,
          ['user-002', 'storekeeper', 'store@localhost', storekeeperHash, 'Storekeeper', 'Store Keeper']
        );
        console.log('✓ Storekeeper user created');

        await runSQL(db, 
          `INSERT INTO users (id, username, email, password_hash, role, full_name, is_active)
           VALUES (?, ?, ?, ?, ?, ?, 1)`,
          ['user-003', 'viewer', 'viewer@localhost', viewerHash, 'Viewer', 'Viewer User']
        );
        console.log('✓ Viewer user created');

        // Seed categories
        console.log('\nSeeding categories...\n');

        const { v4: uuidv4 } = await import('uuid');

        await runSQL(db,
          `INSERT INTO categories (id, name, description, created_by)
           VALUES (?, ?, ?, ?)`,
          [uuidv4(), 'Electronics', 'Electronic components and devices', 'admin-001']
        );
        console.log('✓ Electronics category created');

        await runSQL(db,
          `INSERT INTO categories (id, name, description, created_by)
           VALUES (?, ?, ?, ?)`,
          [uuidv4(), 'Hardware', 'Hardware parts and materials', 'admin-001']
        );
        console.log('✓ Hardware category created');

        await runSQL(db,
          `INSERT INTO categories (id, name, description, created_by)
           VALUES (?, ?, ?, ?)`,
          [uuidv4(), 'Software', 'Software licenses and tools', 'admin-001']
        );
        console.log('✓ Software category created');

        await runSQL(db,
          `INSERT INTO categories (id, name, description, created_by)
           VALUES (?, ?, ?, ?)`,
          [uuidv4(), 'Consumables', 'Consumable items and supplies', 'admin-001']
        );
        console.log('✓ Consumables category created');

        // Seed suppliers
        console.log('\nSeeding suppliers...\n');

        await runSQL(db,
          `INSERT INTO suppliers (id, name, contact_person, email, phone, address, created_by)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [uuidv4(), 'Tech Suppliers Inc', 'John Smith', 'john@techsuppliers.com', '555-0101', '123 Tech Ave', 'admin-001']
        );
        console.log('✓ Tech Suppliers Inc created');

        await runSQL(db,
          `INSERT INTO suppliers (id, name, contact_person, email, phone, address, created_by)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [uuidv4(), 'Global Hardware Co', 'Jane Doe', 'jane@globalhw.com', '555-0102', '456 Hardware St', 'admin-001']
        );
        console.log('✓ Global Hardware Co created');

        await runSQL(db,
          `INSERT INTO suppliers (id, name, contact_person, email, phone, address, created_by)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [uuidv4(), 'Premium Software Ltd', 'Bob Johnson', 'bob@premsoftware.com', '555-0103', '789 Software Blvd', 'admin-001']
        );
        console.log('✓ Premium Software Ltd created');

        console.log('\n✅ Database initialized successfully!\n');
        console.log('Default credentials:');
        console.log('  Admin:       admin / admin123');
        console.log('  Storekeeper: storekeeper / store123');
        console.log('  Viewer:      viewer / view123\n');

        db.close();
        resolve();
      } catch (err) {
        console.error('\n✗ Error:', err.message);
        db.close();
        reject(err);
      }
    });
  });
}

initDatabase()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error('Fatal error:', err.message);
    process.exit(1);
  });
