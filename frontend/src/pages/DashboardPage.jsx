// Dashboard page

import React, { useState, useEffect } from 'react';
import { stockApi, productsApi } from '../api/services';
import { AlertTriangle, Package, Boxes, TrendingDown } from 'lucide-react';

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [summaryRes, lowStockRes] = await Promise.all([
        stockApi.getSummary(),
        productsApi.lowStock(),
      ]);

      setSummary(summaryRes.data);
      setLowStockProducts(lowStockRes.data);
      setError('');
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="p-8">Loading dashboard...</div>;
  }

  // Calculate inventory value with proper type conversion and validation
  const calculateInventoryValue = () => {
    if (!summary || summary.length === 0) return 0;
    return summary.reduce((sum, item) => {
      const quantity = parseInt(item.quantity_on_hand) || 0;
      const unitCost = parseFloat(item.unit_cost) || 0;
      const itemValue = quantity * unitCost;
      return sum + itemValue;
    }, 0);
  };

  const stats = {
    totalProducts: summary?.length || 0,
    totalValue: calculateInventoryValue(),
    lowStockCount: lowStockProducts.length,
    highValueItems: summary?.filter(item => {
      const quantity = parseInt(item.quantity_on_hand) || 0;
      const sellingPrice = parseFloat(item.selling_price) || 0;
      return (quantity * sellingPrice) > 10000;
    }).length || 0,
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Products</p>
              <p className="text-3xl font-bold text-gray-800">{stats.totalProducts}</p>
            </div>
            <Package className="h-12 w-12 text-blue-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Inventory Value</p>
              <p className="text-3xl font-bold text-gray-800">${stats.totalValue.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">${(stats.totalValue / 1000).toFixed(1)}K</p>
            </div>
            <Boxes className="h-12 w-12 text-green-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Low Stock</p>
              <p className="text-3xl font-bold text-red-600">{stats.lowStockCount}</p>
            </div>
            <AlertTriangle className="h-12 w-12 text-red-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">High Value Items</p>
              <p className="text-3xl font-bold text-purple-600">{stats.highValueItems}</p>
            </div>
            <TrendingDown className="h-12 w-12 text-purple-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Low Stock Products
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-4 text-gray-600">SKU</th>
                  <th className="text-left py-2 px-4 text-gray-600">Product</th>
                  <th className="text-left py-2 px-4 text-gray-600">Current Stock</th>
                  <th className="text-left py-2 px-4 text-gray-600">Reorder Level</th>
                </tr>
              </thead>
              <tbody>
                {lowStockProducts.slice(0, 10).map(product => (
                  <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-4 font-mono text-gray-700">{product.sku}</td>
                    <td className="py-2 px-4 text-gray-700">{product.name}</td>
                    <td className="py-2 px-4">
                      <span className="inline-block px-3 py-1 bg-red-100 text-red-700 rounded">
                        {product.quantity_on_hand}
                      </span>
                    </td>
                    <td className="py-2 px-4 text-gray-600">{product.reorder_level}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
