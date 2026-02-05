import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { stockApi, productsApi } from '../api/services';
import { useAuth } from '../hooks/useAuth';

export default function StockManagementPage() {
  const [stocks, setStocks] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    product_id: '',
    transaction_type: 'Stock In',
    quantity: '',
    reference_number: '',
    notes: '',
  });
  const { user } = useAuth();

  const isStorekeeper = user?.role === 'Admin' || user?.role === 'Storekeeper';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [stockRes, productsRes] = await Promise.all([
        stockApi.getSummary(),
        productsApi.list(),
      ]);
      setStocks(stockRes.data || []);
      setProducts(productsRes.data || []);
      setError('');
    } catch (err) {
      console.error('Stock loading error:', err);
      setError('Failed to load stock data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.product_id || !formData.quantity) {
      setError('Product and quantity are required');
      return;
    }

    try {
      const quantity = parseInt(formData.quantity);
      const { product_id, transaction_type, reference_number, notes } = formData;

      // Call appropriate API method based on transaction type
      if (transaction_type === 'Stock In') {
        await stockApi.stockIn(product_id, quantity, reference_number, notes);
      } else if (transaction_type === 'Stock Out') {
        await stockApi.stockOut(product_id, quantity, reference_number, notes);
      } else if (transaction_type === 'Adjustment' || transaction_type === 'Return') {
        // For adjustment/return, use adjust method with the new quantity
        const currentStock = stocks.find(s => s.product_id === product_id);
        const newQuantity = transaction_type === 'Adjustment' 
          ? quantity 
          : (currentStock?.quantity_on_hand || 0) - quantity;
        await stockApi.adjust(product_id, newQuantity, notes);
      }

      setFormData({
        product_id: '',
        transaction_type: 'Stock In',
        quantity: '',
        reference_number: '',
        notes: '',
      });
      setShowForm(false);
      setError('');
      await loadData();
    } catch (err) {
      console.error('Transaction error:', err);
      setError(err.response?.data?.error || 'Failed to record transaction');
    }
  };

  const getProductName = (productId) => {
    return products.find((p) => p.id === productId)?.name || 'Unknown';
  };

  const getLowStockClass = (stock) => {
    const product = products.find((p) => p.id === stock.product_id);
    if (!product) return '';
    return stock.quantity_available < product.reorder_level ? 'bg-red-50' : '';
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Stock Management</h1>
        {isStorekeeper && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-5 w-5" />
            Record Transaction
          </button>
        )}
      </div>

      {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}

      {showForm && isStorekeeper && (
        <div className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Record Stock Transaction</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product *</label>
                <select
                  value={formData.product_id}
                  onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select product</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (SKU: {p.sku})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                <select
                  value={formData.transaction_type}
                  onChange={(e) => setFormData({ ...formData, transaction_type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Stock In">Stock In</option>
                  <option value="Stock Out">Stock Out</option>
                  <option value="Adjustment">Adjustment</option>
                  <option value="Return">Return</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reference #</label>
                <input
                  type="text"
                  value={formData.reference_number}
                  onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="PO#, SO#, etc."
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Record Transaction
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">Loading stock data...</div>
      ) : stocks.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No stock records found</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Product</th>
                <th className="px-4 py-2 text-right text-sm font-semibold text-gray-900">On Hand</th>
                <th className="px-4 py-2 text-right text-sm font-semibold text-gray-900">Reserved</th>
                <th className="px-4 py-2 text-right text-sm font-semibold text-gray-900">Available</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {stocks.map((stock) => {
                const product = products.find((p) => p.id === stock.product_id);
                const isLowStock = stock.quantity_available < (product?.reorder_level || 10);
                return (
                  <tr
                    key={stock.id}
                    className={`border-b border-gray-200 ${
                      isLowStock ? 'bg-red-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className="px-4 py-3 text-sm text-gray-900">{getProductName(stock.product_id)}</td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900">
                      {stock.quantity_on_hand}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900">
                      {stock.quantity_reserved}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                      {stock.quantity_available}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          isLowStock
                            ? 'bg-red-200 text-red-800'
                            : 'bg-green-200 text-green-800'
                        }`}
                      >
                        {isLowStock ? 'Low Stock' : 'OK'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(stock.last_updated).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
