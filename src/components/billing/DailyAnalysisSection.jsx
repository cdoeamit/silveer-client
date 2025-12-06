import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../utils/api';

export default function DailyAnalysisSection() {
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    fetchDailyAnalysis();
  }, [selectedDate]);

  const fetchDailyAnalysis = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/billing/daily-analysis?date=${selectedDate}`);
      if (response.data.success) {
        setAnalysis(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching daily analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent"></div>
        <p className="mt-2 text-gray-600">Loading analysis...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-4 rounded-lg shadow"
      >
        <div className="flex items-center gap-4">
          <label className="font-semibold">Select Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="p-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </motion.div>

      {/* Summary Cards */}
      {analysis && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4"
          >
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
              <p className="text-sm opacity-90">Total Sales</p>
              <p className="text-3xl font-bold">{analysis.totalSales}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-lg shadow-lg">
              <p className="text-sm opacity-90">Total Silver</p>
              <p className="text-3xl font-bold">{parseFloat(analysis.totalSilver || 0).toFixed(2)} g</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
              <p className="text-sm opacity-90">Total Amount</p>
              <p className="text-3xl font-bold">₹{parseFloat(analysis.totalAmount || 0).toLocaleString()}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
              <p className="text-sm opacity-90">Collected</p>
              <p className="text-3xl font-bold">₹{parseFloat(analysis.totalPaid || 0).toLocaleString()}</p>
            </div>
          </motion.div>

          {/* Type-wise Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-lg shadow"
          >
            <h3 className="text-lg font-semibold mb-4">Billing Type Breakdown</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="border-2 border-green-300 p-4 rounded-lg bg-green-50">
                <h4 className="font-semibold text-green-800 mb-3">Wholesale Without GST</h4>
                <p className="text-sm mb-1">Sales: <strong>{analysis.withoutGST.count}</strong></p>
                <p className="text-sm mb-1">Silver: <strong>{parseFloat(analysis.withoutGST.silver || 0).toFixed(2)} g</strong></p>
                <p className="text-sm mb-1">Amount: <strong>₹{parseFloat(analysis.withoutGST.amount || 0).toLocaleString()}</strong></p>
                <p className="text-sm">Paid: <strong>₹{parseFloat(analysis.withoutGST.paid || 0).toLocaleString()}</strong></p>
              </div>
              <div className="border-2 border-blue-300 p-4 rounded-lg bg-blue-50">
                <h4 className="font-semibold text-blue-800 mb-3">Wholesale With GST</h4>
                <p className="text-sm mb-1">Sales: <strong>{analysis.withGST.count}</strong></p>
                <p className="text-sm mb-1">Silver: <strong>{parseFloat(analysis.withGST.silver || 0).toFixed(2)} g</strong></p>
                <p className="text-sm mb-1">Amount: <strong>₹{parseFloat(analysis.withGST.amount || 0).toLocaleString()}</strong></p>
                <p className="text-sm">Paid: <strong>₹{parseFloat(analysis.withGST.paid || 0).toLocaleString()}</strong></p>
              </div>
            </div>
          </motion.div>

          {/* Sales List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow overflow-hidden"
          >
            <h3 className="text-lg font-semibold p-4 border-b">Today's Sales</h3>
            {analysis.sales.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No sales found for this date</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Voucher</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Silver (g)</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Paid</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {analysis.sales.map((sale) => (
                      <tr key={sale.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium">{sale.voucherNumber}</td>
                        <td className="px-4 py-3 text-sm">{sale.customer.name}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 rounded text-xs ${
                            sale.billingType === 'wholesale' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {sale.billingType === 'wholesale' ? 'With GST' : 'Without GST'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-bold text-orange-600">
                          {parseFloat(sale.totalSilverWeight).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-medium">
                          ₹{parseFloat(sale.totalAmount).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-green-600 font-medium">
                          ₹{parseFloat(sale.paidAmount).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-red-600 font-medium">
                          ₹{parseFloat(sale.balanceAmount).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </>
      )}
    </div>
  );
}
