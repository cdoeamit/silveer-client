import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';
import { generateRegularPDF } from '../../utils/regularPdfGenerator';


export default function RegularSaleDetailModal({ sale, onClose, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: 0,
    paymentMode: 'cash',
    referenceNumber: '',
    notes: ''
  });
const [showSilverPaymentModal, setShowSilverPaymentModal] = useState(false);
const [silverPaymentData, setSilverPaymentData] = useState({
  silverWeight: '',
  silverRate: sale?.silverRate || 0,
  notes: ''
});


  const handleAddPayment = async () => {
    if (paymentData.amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }


    setLoading(true);
    try {
      const response = await api.post(`/regular-billing/sales/${sale.id}/payment`, paymentData);
      if (response.data.success) {
        alert('Payment added successfully!');
        setPaymentData({ amount: 0, paymentMode: 'cash', referenceNumber: '', notes: '' });
        setShowPaymentForm(false);
        onUpdate();
      }
    } catch (error) {
      console.error('Error adding payment:', error);
      alert('Error adding payment: ' + error.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };


  const handleDownloadPDF = () => {
    try {
      generateRegularPDF(sale);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF');
    }
  };


  const getStatusColor = (status) => {
    const colors = {
      paid: 'text-green-600',
      partial: 'text-yellow-600',
      pending: 'text-red-600',
      cancelled: 'text-gray-600'
    };
    return colors[status] || 'text-gray-600';
  };
  const handleAddSilverPayment = async (e) => {
  e.preventDefault();
  
  try {
    const response = await api.post(`/regular-billing/sales/${sale.id}/silver-payment`, silverPaymentData);

    
    if (response.data.status === 'success') {
      alert('Silver payment added successfully!');
      setShowSilverPaymentModal(false);
      setSilverPaymentData({
        silverWeight: '',
        silverRate: sale?.silverRate || 0,
        notes: ''
      });
      onUpdate && onUpdate();
      onClose();
    }
  } catch (error) {
    console.error('Error adding silver payment:', error);
    alert(error.response?.data?.message || 'Failed to add silver payment');
  }
};



  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">{sale.voucherNumber}</h2>
              <p className="text-green-100 text-sm">
                {new Date(sale.saleDate).toLocaleDateString('en-GB')}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition"
            >
              ✕
            </button>
          </div>


          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Customer Info - ✅ CHANGED FROM sale.user TO sale.customer */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-3">Customer Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Name</p>
                  <p className="font-medium">{sale.customer?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Phone</p>
                  <p className="font-medium">{sale.customer?.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Address</p>
                  <p className="font-medium">{sale.customer?.address || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Payment Mode</p>
                  <p className="font-medium">
                    {sale.paymentMode.charAt(0).toUpperCase() + sale.paymentMode.slice(1)}
                  </p>
                </div>
              </div>
            </div>


            {/* Sale Summary */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-gray-600 text-sm">Total Silver Weight</p>
                <p className="text-2xl font-bold text-orange-600">
                  {parseFloat(sale.totalSilverWeight).toFixed(3)} g
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-gray-600 text-sm">Total Amount</p>
                <p className="text-2xl font-bold text-green-600">
                  ₹{parseFloat(sale.totalAmount).toFixed(2)}
                </p>
              </div>
            </div>


            {/* Items Table */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-3">Items</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-2 text-left">Description</th>
                      <th className="px-4 py-2 text-right">Net Wt (g)</th>
                      <th className="px-4 py-2 text-right">Silver (g)</th>
                      <th className="px-4 py-2 text-right">Labor</th>
                      <th className="px-4 py-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sale.items.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-2">{item.description}</td>
                        <td className="px-4 py-2 text-right">{parseFloat(item.netWeight).toFixed(3)}</td>
                        <td className="px-4 py-2 text-right font-medium text-orange-600">
                          {parseFloat(item.silverWeight).toFixed(3)}
                        </td>
                        <td className="px-4 py-2 text-right">₹{parseFloat(item.laborCharges).toFixed(2)}</td>
                        <td className="px-4 py-2 text-right font-medium">
                          ₹{parseFloat(item.itemAmount).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>


            {/* Financial Summary */}
            <div className="border-l-4 border-green-500 bg-green-50 p-4 rounded">
              <h3 className="font-semibold text-gray-700 mb-3">Financial Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Labor Charges:</span>
                  <span className="font-medium">₹{parseFloat(sale.totalLaborCharges).toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span>Total Amount:</span>
                  <span className="font-bold text-green-600">₹{parseFloat(sale.totalAmount).toFixed(2)}</span>
                </div>
                {sale.previousBalance > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Previous Due:</span>
                    <span className="font-medium">₹{parseFloat(sale.previousBalance).toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>


            {/* Payment Details */}
            <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded">
              <h3 className="font-semibold text-gray-700 mb-3">Payment Details</h3>
              <div className="space-y-2 text-sm">
                {/* Dynamically calculate values */}
                {(() => {
                  const paidAmount = parseFloat(sale.paidAmount || 0);
                  const paidSilver = parseFloat(sale.paidSilver || 0);
                  const silverRate = parseFloat(sale.silverRate || 0);
                  const cashPaid = paidAmount - (paidSilver * silverRate);


                  return (
                    <>
                      <div className="flex justify-between">
                        <span>Cash/Card Paid:</span>
                        <span className="font-medium">
                          ₹{cashPaid.toFixed(2)}
                        </span>
                      </div>
                      {paidSilver > 0 && (
                        <>
                          <div className="flex justify-between text-blue-600">
                            <span>Silver Returned:</span>
                            <span className="font-medium">{paidSilver.toFixed(3)} g</span>
                          </div>
                          <div className="flex justify-between text-blue-600">
                            <span>Silver Value:</span>
                            <span className="font-medium">
                              ₹{(paidSilver * silverRate).toFixed(2)}
                            </span>
                          </div>
                        </>
                      )}
                      <div className="flex justify-between border-t pt-2">
                        <span>Total Paid:</span>
                        <span className="font-bold text-green-600">₹{paidAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span>Balance Amount:</span>
                        <span className={`font-bold text-lg ${sale.balanceAmount <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ₹{parseFloat(sale.balanceAmount).toFixed(2)}
                        </span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>


            {/* Status */}
            <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
              <span className="font-semibold text-gray-700">Status:</span>
              <span className={`text-lg font-bold ${getStatusColor(sale.status)}`}>
                {sale.status.toUpperCase()}
              </span>
            </div>


            {/* Transactions History */}
            {sale.transactions && sale.transactions.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">Transaction History</h3>
                <div className="space-y-2 text-sm max-h-40 overflow-y-auto">
                  {sale.transactions.map((trans) => (
                    <div key={trans.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{trans.type.toUpperCase()}</p>
                        <p className="text-gray-600 text-xs">
                          {new Date(trans.transactionDate).toLocaleString('en-GB')}
                        </p>
                      </div>
                      <span className={`font-bold ${trans.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ₹{parseFloat(trans.amount).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}


            {/* Actions */}
            <div className="flex gap-3 flex-wrap">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDownloadPDF}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                📥 Download PDF
              </motion.button>


              {parseFloat(sale.balanceAmount) > 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowPaymentForm(!showPaymentForm)}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                >
                  💰 Add Payment
                </motion.button>
              )}
              {sale.status !== 'paid' && (
  <motion.button
    onClick={() => setShowSilverPaymentModal(true)}
    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
  >
    💎 Pay with Silver
  </motion.button>
)}


              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-gray-400 text-white rounded-lg hover:bg-gray-500 font-medium"
              >
                ✕ Close
              </motion.button>
            </div>


            {/* Payment Form */}
            <AnimatePresence>
              {showPaymentForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-yellow-50 p-4 rounded-lg space-y-4 border-l-4 border-yellow-500"
                >
                  <h4 className="font-semibold text-gray-700">Add Payment</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Amount (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={paymentData.amount}
                        onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                        placeholder={`Max: ₹${parseFloat(sale.balanceAmount).toFixed(2)}`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Payment Mode</label>
                      <select
                        value={paymentData.paymentMode}
                        onChange={(e) => setPaymentData({ ...paymentData, paymentMode: e.target.value })}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                      >
                        <option value="cash">Cash</option>
                        <option value="card">Card</option>
                        <option value="upi">UPI</option>
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="cheque">Cheque</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Reference Number (Optional)</label>
                      <input
                        type="text"
                        value={paymentData.referenceNumber}
                        onChange={(e) => setPaymentData({ ...paymentData, referenceNumber: e.target.value })}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                        placeholder="Cheque/Transaction No"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
                      <textarea
                        value={paymentData.notes}
                        onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                        rows="2"
                        placeholder="Any additional notes"
                      />
                    </div>
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAddPayment}
                        disabled={loading}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
                      >
                        {loading ? 'Processing...' : '✓ Add Payment'}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowPaymentForm(false)}
                        className="flex-1 px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 font-medium"
                      >
                        ✕ Cancel
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      
      {/* Silver Payment Modal */}
{showSilverPaymentModal && (
  <div 
    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    onClick={() => {
      setShowSilverPaymentModal(false);
      setSilverPaymentData({
        silverWeight: '',
        silverRate: sale?.silverRate || 0,
        notes: ''
      });
    }}
  >
    <div 
      className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
      onClick={(e) => e.stopPropagation()}
    >
      <h3 className="text-xl font-bold mb-4">Pay with Silver</h3>
      
      <form onSubmit={handleAddSilverPayment}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Silver Weight (grams) *
            </label>
            <input
              type="number"
              step="0.001"
              value={silverPaymentData.silverWeight}
              onChange={(e) => setSilverPaymentData({
                ...silverPaymentData,
                silverWeight: e.target.value
              })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
              min="0.001"
            />
          </div>


          <div>
            <label className="block text-sm font-medium mb-1">
              Silver Rate (₹/gram)
            </label>
            <input
              type="number"
              step="0.01"
              value={silverPaymentData.silverRate}
              onChange={(e) => setSilverPaymentData({
                ...silverPaymentData,
                silverRate: e.target.value
              })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>


          <div className="bg-blue-50 p-3 rounded-lg">
            <label className="block text-sm font-medium text-blue-900">
              Total Value: ₹{(silverPaymentData.silverWeight * silverPaymentData.silverRate).toFixed(2)}
            </label>
          </div>


          <div>
            <label className="block text-sm font-medium mb-1">
              Notes (Optional)
            </label>
            <textarea
              value={silverPaymentData.notes}
              onChange={(e) => setSilverPaymentData({
                ...silverPaymentData,
                notes: e.target.value
              })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows="2"
            />
          </div>
        </div>


        <div className="flex gap-2 mt-6">
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Add Silver Payment
          </button>
          <button
            type="button"
            onClick={() => {
              setShowSilverPaymentModal(false);
              setSilverPaymentData({
                silverWeight: '',
                silverRate: sale?.silverRate || 0,
                notes: ''
              });
            }}
            className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
)}



      </motion.div>
    </AnimatePresence>
  );
}
