// Sidebar navigation

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  LayoutDashboard,
  Package,
  Boxes,
  Layers,
  Truck,
  FileText,
  Users,
} from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path) => location.pathname === path;

  const canManageInventory = ['Admin', 'Storekeeper'].includes(user?.role);
  const canViewReports = ['Admin', 'Storekeeper', 'Viewer'].includes(user?.role);
  const isAdmin = user?.role === 'Admin';

  return (
    <aside className="w-64 bg-gray-900 text-white">
      <nav className="p-4 space-y-2">
        <Link
          to="/"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
            isActive('/') ? 'bg-blue-600' : 'hover:bg-gray-800'
          }`}
        >
          <LayoutDashboard className="h-5 w-5" />
          <span>Dashboard</span>
        </Link>

        {canManageInventory && (
          <>
            <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Inventory
            </div>

            <Link
              to="/products"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                isActive('/products') ? 'bg-blue-600' : 'hover:bg-gray-800'
              }`}
            >
              <Package className="h-5 w-5" />
              <span>Products</span>
            </Link>

            <Link
              to="/stock"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                isActive('/stock') ? 'bg-blue-600' : 'hover:bg-gray-800'
              }`}
            >
              <Boxes className="h-5 w-5" />
              <span>Stock Management</span>
            </Link>

            <Link
              to="/categories"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                isActive('/categories') ? 'bg-blue-600' : 'hover:bg-gray-800'
              }`}
            >
              <Layers className="h-5 w-5" />
              <span>Categories</span>
            </Link>

            <Link
              to="/suppliers"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                isActive('/suppliers') ? 'bg-blue-600' : 'hover:bg-gray-800'
              }`}
            >
              <Truck className="h-5 w-5" />
              <span>Suppliers</span>
            </Link>
          </>
        )}

        {canViewReports && (
          <>
            <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Reports
            </div>

            <Link
              to="/reports/transactions"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                isActive('/reports/transactions') ? 'bg-blue-600' : 'hover:bg-gray-800'
              }`}
            >
              <FileText className="h-5 w-5" />
              <span>Transactions</span>
            </Link>
          </>
        )}

        {isAdmin && (
          <>
            <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Administration
            </div>

            <Link
              to="/users"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                isActive('/users') ? 'bg-blue-600' : 'hover:bg-gray-800'
              }`}
            >
              <Users className="h-5 w-5" />
              <span>Users</span>
            </Link>
          </>
        )}
      </nav>
    </aside>
  );
}
