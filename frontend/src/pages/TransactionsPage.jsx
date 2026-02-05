import React, { useState, useEffect } from 'react';
import { stockApi } from '../api/services';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    loadTransactions();
  }, [filters]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const response = await stockApi.getAllTransactions(
        filters.startDate,
        filters.endDate
      );
      
      let filtered = response.data || [];
      
      // Apply transaction type filter if specified
      if (filters.type) {
        filtered = filtered.filter(t => t.transaction_type === filters.type);
      }
      
      setTransactions(filtered);
      setError('');
    } catch (err) {
      console.error('Error loading transactions:', err);
      setError('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'Stock In':
        return 'bg-green-100 text-green-800';
      case 'Stock Out':
        return 'bg-blue-100 text-blue-800';
      case 'Adjustment':
        return 'bg-yellow-100 text-yellow-800';
      case 'Return':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Transaction History</h1>

      {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}

      <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200 space-y-4">
        <h2 className="font-semibold text-gray-900">Filters</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Type</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="Stock In">Stock In</option>
              <option value="Stock Out">Stock Out</option>
              <option value="Adjustment">Adjustment</option>
              <option value="Return">Return</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading transactions...</div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No transactions found</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Date</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Type</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Product</th>
                <th className="px-4 py-2 text-right text-sm font-semibold text-gray-900">Quantity</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Reference</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Notes</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Created By</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction, idx) => (
                <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(transaction.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getTransactionColor(transaction.transaction_type)}`}>
                      {transaction.transaction_type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{transaction.product_name || 'Unknown'}</td>
                  <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                    {transaction.quantity}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {transaction.reference_number || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                    {transaction.notes || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{transaction.created_by}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
