import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';

export default function CustomerLedgerModal({ customer, onClose }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchLedger();
  }, [dateFilter]);

  const fetchLedger = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(dateFilter);
      const response = await api.get(`/billing/customers/${customer.id}/ledger?${params}`);
      if (response.data.success) {
        setTransactions(response.data.data.transactions);
      }
    } catch (error) {
      console.error('Error fetching ledger:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-xl">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Customer Ledger</h2>
                <p className="text-sm opacity-90">{customer.name} - {customer.phone}</p>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:bg-white/20 rounded-full p-2 transition"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Customer Balance */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-lg shadow-lg">
              <p className="text-sm opacity-90">Current Balance</p>
              <p className="text-4xl font-bold">₹{parseFloat(customer.balance).toLocaleString()}</p>
            </div>

            {/* Date Filter */}
            <div className="bg-white border rounded-lg p-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date</label>
                  <input
                    type="date"
                    value={dateFilter.startDate}
                    onChange={(e) => setDateFilter({...dateFilter, startDate: e.target.value})}
                    className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Date</label>
                  <input
                    type="date"
                    value={dateFilter.endDate}
                    onChange={(e) => setDateFilter({...dateFilter, endDate: e.target.value})}
                    className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => setDateFilter({ startDate: '', endDate: '' })}
                    className="w-full px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                  >
                    Clear Filter
                  </button>
                </div>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="border rounded-lg overflow-hidden">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent"></div>
                </div>
              ) : transactions.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No transactions found</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Type
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Voucher No.
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          Debit
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          Credit
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          Balance
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Notes
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {transactions.map((txn, index) => (
                        <motion.tr
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-4 py-3">
                            {new Date(txn.transactionDate).toLocaleDateString('en-GB')}
                          </td>
                          <td className="px-4 py-3 capitalize">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              txn.type === 'sale' ? 'bg-red-100 text-red-800' :
                              txn.type === 'payment' ? 'bg-green-100 text-green-800' :
                              txn.type === 'silver_return' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {txn.type.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {txn.sale?.voucherNumber || '-'}
                          </td>
                          <td className="px-4 py-3 text-right text-red-600 font-medium">
                            {parseFloat(txn.amount) > 0 ? `₹${parseFloat(txn.amount).toFixed(2)}` : '-'}
                          </td>
                          <td className="px-4 py-3 text-right text-green-600 font-medium">
                            {parseFloat(txn.amount) < 0 ? `₹${Math.abs(parseFloat(txn.amount)).toFixed(2)}` : '-'}
                          </td>
                          <td className="px-4 py-3 text-right font-bold">
                            ₹{parseFloat(txn.balanceAfter).toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {txn.type === 'silver_return' && txn.silverWeight ? 
                              `Silver: ${parseFloat(txn.silverWeight).toFixed(3)} kg` : 
                              (txn.notes || '-')
                            }
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}