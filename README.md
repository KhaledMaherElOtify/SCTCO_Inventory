# Inventory Management System - Production LAN

A complete production-ready inventory management system for local network deployment. Built with React, Node.js/Express, and SQLite.

## 🎯 Features

### Core Inventory Management
- ✅ Product management with SKUs and categories
- ✅ Multi-supplier support
- ✅ Real-time stock tracking with reorder levels
- ✅ Stock in/out transactions with audit trails
- ✅ Low stock alerts and notifications
- ✅ Stock adjustment and reconciliation

### User Management & Security
- ✅ Role-based access control (Admin, Storekeeper, Viewer)
- ✅ JWT authentication with refresh tokens
- ✅ Password hashing with bcryptjs
- ✅ User activity audit logging
- ✅ Session management

### Reporting & Analytics
- ✅ Stock summary reports
- ✅ Transaction history with date filtering
- ✅ Inventory value calculations
- ✅ Low stock analysis
- ✅ Multi-user simultaneous access

### Production Deployment
- ✅ LAN-only access (no internet required)
- ✅ PM2 process management with auto-restart
- ✅ Nginx reverse proxy and static file serving
- ✅ SQLite database with proper schema and indexes
- ✅ Comprehensive logging and monitoring
- ✅ Database backups and recovery

## 📋 System Requirements

### Server Machine
- **OS**: Windows, Linux, or macOS
- **Node.js**: v16 or higher
- **RAM**: 1GB minimum (2GB recommended)
- **Disk**: 5GB minimum for database and backups
- **Network**: LAN connectivity

### Client Machines
- **Browser**: Modern browser (Chrome, Firefox, Safari, Edge)
- **Network**: LAN connectivity to server

## 🚀 Quick Start

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install --legacy-peer-deps

# Create .env file
cp .env.example .env

# Initialize database
npm run init-db

# Start backend
npm start
```

Backend runs on `http://localhost:3001`

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Build production
npm run build

# Or run dev server (for testing)
npm run dev
```

Frontend built files in `frontend/dist/`

### 3. Access System

**Development Mode:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

**Production Mode:**
- Frontend: http://192.168.1.100 (your server IP)
- Backend API: http://192.168.1.100 (via Nginx proxy)

### 4. Default Credentials

```
Role: Admin
Username: admin
Password: admin123

Role: Storekeeper
Username: storekeeper
Password: store123

Role: Viewer
Username: viewer
Password: view123
```

**⚠️ Change these credentials before production deployment!**

## 📁 Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── index.js         # Configuration management
│   │   │   └── database.js      # Database initialization
│   │   ├── controllers/          # Request handlers
│   │   ├── services/            # Business logic
│   │   ├── middleware/          # Express middleware
│   │   ├── routes/              # API routes
│   │   └── server.js            # Main server file
│   ├── sql/
│   │   └── schema.sql           # Database schema
│   ├── data/                    # SQLite database (auto-created)
│   ├── logs/                    # Server logs
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── api/                 # API service functions
│   │   ├── components/          # React components
│   │   ├── context/             # React context (auth)
│   │   ├── hooks/               # Custom hooks
│   │   ├── pages/               # Page components
│   │   ├── config/              # Configuration
│   │   ├── App.jsx              # Main app component
│   │   ├── main.jsx             # Entry point
│   │   └── index.css            # Global styles
│   ├── dist/                    # Production build (auto-generated)
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── index.html
│   └── .env.example
│
├── deployment/
│   ├── DEPLOYMENT_GUIDE.md      # Detailed deployment steps
│   ├── nginx.conf               # Nginx configuration
│   ├── ecosystem.config.js      # PM2 configuration
│   └── README.md
│
└── README.md                    # This file
```

## 🔧 API Endpoints

### Authentication
```
POST   /api/auth/login              Login with credentials
POST   /api/auth/logout             Logout (client clears token)
POST   /api/auth/refresh            Refresh access token
GET    /api/auth/profile            Get current user profile
POST   /api/auth/change-password    Change password
```

### Products
```
GET    /api/products                List all products
GET    /api/products/:id            Get product details
GET    /api/products/low-stock      Get low stock alerts
POST   /api/products                Create new product
PUT    /api/products/:id            Update product
POST   /api/products/:id/deactivate Deactivate product
```

### Stock Management
```
GET    /api/stock/summary           Get stock summary
GET    /api/stock/product/:id       Get product stock
GET    /api/stock/product/:id/history Get transaction history
GET    /api/stock/transactions/all  Get all transactions (filtered)
POST   /api/stock/in                Record stock in
POST   /api/stock/out               Record stock out
POST   /api/stock/adjust            Adjust stock quantity
```

### Categories
```
GET    /api/categories              List all categories
GET    /api/categories/:id          Get category
POST   /api/categories              Create category
PUT    /api/categories/:id          Update category
DELETE /api/categories/:id          Delete category
```

### Suppliers
```
GET    /api/suppliers               List all suppliers
GET    /api/suppliers/:id           Get supplier
POST   /api/suppliers               Create supplier
PUT    /api/suppliers/:id           Update supplier
DELETE /api/suppliers/:id           Delete supplier
```

### Users (Admin only)
```
GET    /api/users                   List all users
GET    /api/users/:id               Get user
POST   /api/users                   Create user
PUT    /api/users/:id               Update user
POST   /api/users/:id/deactivate    Deactivate user
DELETE /api/users/:id               Delete user
```

## 🔒 Security Features

- **Authentication**: JWT tokens with expiration (default 7 days)
- **Authorization**: Role-based access control
- **Password Security**: Bcryptjs hashing (10 rounds)
- **CORS**: Restricted to configured LAN IPs
- **Audit Logging**: All changes tracked with user and timestamp
- **SQL Injection Protection**: Parameterized queries
- **Rate Limiting**: Can be added via middleware
- **Helmet.js**: Security headers configured

## 📊 Role-Based Access Control

### Admin
- Full system access
- User management
- Product creation and modification
- Stock adjustment
- All reports and analytics

### Storekeeper
- Product management
- Stock in/out operations
- Category and supplier management
- View reports and transactions
- Cannot manage users or adjust stock

### Viewer
- Read-only access
- View inventory status
- View reports
- View transaction history
- Cannot modify any data

## 💾 Database

### SQLite Schema

Tables:
- `users` - User accounts and roles
- `products` - Product catalog with pricing
- `categories` - Product categories
- `suppliers` - Supplier information
- `stock` - Current stock levels
- `stock_transactions` - Stock in/out history
- `purchase_orders` - PO tracking (for future)
- `sales_orders` - Sales tracking (for future)
- `audit_logs` - Complete audit trail

All tables include:
- Auto-generated IDs
- Timestamps (created_at, updated_at)
- Foreign key relationships
- Proper indexes for performance

### Backup

```bash
# Manual backup
cp backend/data/inventory.db backups/inventory_$(date +%Y-%m-%d).db

# Automated backup (see DEPLOYMENT_GUIDE.md)
```

## 🚀 Production Deployment

See [DEPLOYMENT_GUIDE.md](./deployment/DEPLOYMENT_GUIDE.md) for:
- Step-by-step deployment instructions
- Nginx configuration
- PM2 process management
- Database setup and backups
- Troubleshooting guide
- Security hardening
- Performance optimization

### Quick Deploy

1. Configure `.env` files
2. `npm install` in both directories
3. `npm run init-db` in backend
4. `npm run build` in frontend
5. Set up Nginx/IIS with provided config
6. Start backend with PM2
7. Access via LAN IP

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm start

# Test health
curl http://localhost:3001/health

# Test login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Frontend Testing
```bash
cd frontend
npm run dev
# Open http://localhost:5173 in browser
```

## 📝 Development Notes

### Adding New Features

1. **Backend**: Add service → controller → route
2. **Frontend**: Add API call → component → page
3. **Database**: Update `schema.sql` if needed

### File Organization

- **Services**: Pure business logic, database queries
- **Controllers**: Request validation, response formatting
- **Routes**: URL mapping and middleware
- **Components**: Reusable UI elements
- **Pages**: Full page views
- **Context**: Global state management

### Environment Variables

**Backend (.env):**
- `NODE_ENV`: production/development
- `PORT`: Server port
- `HOST`: Binding address
- `JWT_SECRET`: Token signing key
- `ALLOWED_ORIGINS`: CORS whitelist
- `DATABASE_PATH`: SQLite file location

**Frontend (.env.local):**
- `VITE_API_URL`: Backend API endpoint
- `VITE_API_PORT`: Backend port

## 🐛 Troubleshooting

### Common Issues

**"Cannot connect to API"**
- Check backend running: `npm start`
- Check port 3001 not in use
- Check CORS settings in `.env`

**"Database locked"**
- Ensure single backend instance
- Check no other processes using database
- Restart backend

**"Login fails"**
- Check database initialized
- Verify default users exist
- Check JWT_SECRET set

**"Nginx returns 502"**
- Verify backend running on 3001
- Check Nginx config points to localhost:3001
- Check firewall allows traffic

See [DEPLOYMENT_GUIDE.md](./deployment/DEPLOYMENT_GUIDE.md) for detailed troubleshooting.

## 📞 Support

### Documentation
- API: See routes in `backend/src/routes/`
- Database: `backend/sql/schema.sql`
- Components: `frontend/src/components/`

### Logs
- Backend: `backend/logs/`
- Frontend: Browser console
- System: `pm2 logs inventory-api`

## 📄 License

This project is provided as-is for local network deployment.

## ✅ Deployment Checklist

Before going live:

- [ ] Change default admin password
- [ ] Update JWT_SECRET in .env
- [ ] Configure correct LAN IP in Nginx
- [ ] Set NODE_ENV=production
- [ ] Enable PM2 auto-start
- [ ] Configure automated backups
- [ ] Test from multiple client machines
- [ ] Verify firewall rules
- [ ] Document admin procedures
- [ ] Train team on system

---

**Ready to deploy?** Start with [DEPLOYMENT_GUIDE.md](./deployment/DEPLOYMENT_GUIDE.md)
#   S C T C O _ I n v e n t o r y  
 