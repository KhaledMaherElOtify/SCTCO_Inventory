// Configuration management for production environment
// Loads from .env file and provides validated config

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const config = {
  // Server
  node_env: process.env.NODE_ENV || 'production',
  port: parseInt(process.env.PORT || '3001', 10),
  host: process.env.HOST || '0.0.0.0',

  // Database
  database_path: process.env.DATABASE_PATH || path.join(__dirname, '../../data/inventory.db'),

  // JWT
  jwt_secret: process.env.JWT_SECRET || 'change-this-secret-key-in-production',
  jwt_expiration: process.env.JWT_EXPIRATION || '7d',
  jwt_refresh_expiration: process.env.JWT_REFRESH_EXPIRATION || '30d',

  // CORS - parse allowed origins from comma-separated string
  allowed_origins: (process.env.ALLOWED_ORIGINS || 'http://localhost:3001,http://localhost:5173,http://127.0.0.1:3001,http://127.0.0.1:5173').split(',').map(o => o.trim()),

  // Security
  bcrypt_rounds: parseInt(process.env.BCRYPT_ROUNDS || '10', 10),

  // Logging
  log_level: process.env.LOG_LEVEL || 'info',
  log_dir: process.env.LOG_DIR || path.join(__dirname, '../../logs'),

  // Session
  session_timeout: parseInt(process.env.SESSION_TIMEOUT || '3600000', 10),
};

// Validation
if (config.jwt_secret === 'change-this-secret-key-in-production') {
  console.warn('⚠️  WARNING: JWT_SECRET not configured. Using default insecure secret!');
}

if (config.node_env === 'production' && config.allowed_origins.includes('http://localhost:5173')) {
  console.warn('⚠️  WARNING: localhost:5173 allowed in production CORS config');
}

export default config;
