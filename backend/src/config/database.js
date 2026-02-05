// Database initialization and connection
// Handles SQLite setup with proper schema

import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import config from '../config/index.js';

let db = null;

export async function initializeDatabase() {
  if (db) return db;

  try {
    db = await open({
      filename: config.database_path,
      driver: sqlite3.Database,
    });

    // Enable foreign keys
    await db.exec('PRAGMA foreign_keys = ON');
    
    // Enable WAL mode for better concurrency
    await db.exec('PRAGMA journal_mode = WAL');

    console.log('✓ Database initialized at', config.database_path);
    return db;
  } catch (error) {
    console.error('✗ Database initialization failed:', error.message);
    throw error;
  }
}

export function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase first.');
  }
  return db;
}

export async function closeDatabase() {
  if (db) {
    await db.close();
    db = null;
    console.log('✓ Database connection closed');
  }
}

export default getDatabase;
