import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../utils/api';

export default function SilverRatesSection() {
  const [rates, setRates] = useState([]);
  const [currentRate, setCurrentRate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRate, setNewRate] = useState({
    date: new Date().toISOString().split('T')[0],
    ratePerGram: ''
  });

  useEffect(() => {
    fetchRates();
    fetchCurrentRate();
  }, []);

  const fetchCurrentRate = async () => {
    try {
      const response = await api.get('/billing/silver-rate/current');
      if (response.data.success) {
        setCurrentRate(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching current rate:', error);
    }
  };

  const fetchRates = async () => {
    setLoading(true);
    try {
      const response = await api.get('/billing/silver-rate/history?limit=60');
      if (response.data.success) {
        setRates(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching rates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRate = async () => {
    if (!newRate.date || !newRate.ratePerGram) {
      alert('Please fill all fields');
      return;
    }

    try {
      const response = await api.post('/billing/silver-rate', newRate);
      if (response.data.success) {
        alert(response.data.message);
        setShowAddModal(false);
        setNewRate({
          date: new Date().toISOString().split('T')[0],
          ratePerGram: ''
        });
        fetchRates();
        fetchCurrentRate();
      }
    } catch (error) {
      console.error('Error adding rate:', error);
      alert('Error adding rate: ' + error.response?.data?.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Rate Card */}
      {currentRate && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-8 rounded-xl shadow-2xl"
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm opacity-90 mb-2">Current Silver Rate</p>
              <p className="text-6xl font-bold">₹{parseFloat(currentRate.ratePerGram).toFixed(2)}</p>
              <p className="text-lg opacity-90 mt-2">per gram</p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">Effective Date</p>
              <p className="text-3xl font-semibold mt-1">
                {new Date(currentRate.date).toLocaleDateString('en-GB')}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddModal(true)}
                className="mt-4 px-6 py-2 bg-white text-yellow-600 rounded-lg font-semibold hover:bg-yellow-50"
              >
                Update Rate
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Rate History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-lg shadow overflow-hidden"
      >
        <div className="px-6 py-4 border-b bg-gray-50">
          <h2 className="text-xl font-semibold">Rate History</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-yellow-500 border-t-transparent"></div>
            <p className="mt-2 text-gray-600">Loading rates...</p>
          </div>
        ) : rates.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No rates found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Rate per Gram (₹)
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Change
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {rates.map((rate, index) => {
                  const prevRate = rates[index + 1];
                  const change = prevRate 
                    ? parseFloat(rate.ratePerGram) - parseFloat(prevRate.ratePerGram)
                    : 0;
                  const changePercent = prevRate
                    ? ((change / parseFloat(prevRate.ratePerGram)) * 100).toFixed(2)
                    : 0;

                  return (
                    <motion.tr
                      key={rate.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 text-sm font-medium">
                        {new Date(rate.date).toLocaleDateString('en-GB', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm text-right font-bold text-yellow-600">
                        ₹{parseFloat(rate.ratePerGram).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm text-right">
                        {prevRate && (
                          <span className={`font-medium ${
                            change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {change > 0 ? '↑' : change < 0 ? '↓' : '→'} {change > 0 ? '+' : ''}{change.toFixed(2)}
                            {' '}({change > 0 ? '+' : ''}{changePercent}%)
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {rate.isActive ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                            ACTIVE
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-medium">
                            INACTIVE
                          </span>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Add/Update Rate Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white p-6 rounded-lg shadow-lg w-96"
          >
            <h3 className="text-xl font-semibold mb-4">Add/Update Silver Rate</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  type="date"
                  value={newRate.date}
                  onChange={(e) => setNewRate({...newRate, date: e.target.value})}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-yellow-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Rate per Gram (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newRate.ratePerGram}
                  onChange={(e) => setNewRate({...newRate, ratePerGram: e.target.value})}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-yellow-500"
                  placeholder="100.00"
                />
              </div>

              <div className="bg-blue-50 p-3 rounded text-sm">
                <p className="font-medium mb-1">Note:</p>
                <p className="text-gray-600">
                  If a rate already exists for this date, it will be updated. Otherwise, a new rate will be created.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleAddRate}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
              >
                Save Rate
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}