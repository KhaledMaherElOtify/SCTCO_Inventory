// Main Express server
// Production-ready with all middleware and routes

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import config from './config/index.js';
import { initializeDatabase, closeDatabase } from './config/database.js';
import { initializeSchema, seedInitialData } from './utils/initDatabase.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { auditMiddleware } from './middleware/audit.js';

// Routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import productRoutes from './routes/products.js';
import categoryRoutes from './routes/categories.js';
import supplierRoutes from './routes/suppliers.js';
import stockRoutes from './routes/stock.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Create logs directory if it doesn't exist
const logsDir = config.log_dir;
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Security middleware
app.use(helmet());

// CORS configuration - restrict to LAN IPs
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || config.allowed_origins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// Request parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Logging
const logStream = fs.createWriteStream(path.join(logsDir, 'access.log'), { flags: 'a' });
app.use(morgan('combined', { stream: logStream }));
if (config.node_env !== 'production') {
  app.use(morgan('dev'));
}

// Audit middleware
app.use(auditMiddleware);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: config.node_env,
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/stock', stockRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// Initialize database and start server
async function startServer() {
  try {
    console.log('🔧 Initializing Inventory Management System...');
    console.log(`📍 Environment: ${config.node_env}`);
    console.log(`🔑 Allowed origins: ${config.allowed_origins.join(', ')}`);

    // Initialize database
    await initializeDatabase();

    // Initialize schema
    await initializeSchema();

    // Seed initial data
    await seedInitialData();

    // Start listening
    const server = app.listen(config.port, config.host, () => {
      console.log(`✅ Server started on http://${config.host}:${config.port}`);
      console.log(`📊 Dashboard will be accessible via LAN IP`);
      console.log(`📝 API documentation: http://localhost:${config.port}/api/`);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('🛑 SIGTERM received, shutting down gracefully...');
      server.close(async () => {
        await closeDatabase();
        console.log('✓ Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', async () => {
      console.log('🛑 SIGINT received, shutting down gracefully...');
      server.close(async () => {
        await closeDatabase();
        console.log('✓ Server closed');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
