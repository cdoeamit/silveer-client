import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../utils/api';

export default function CreateSaleSection({ onSaleCreated }) {
  const [loading, setLoading] = useState(false);
  const [silverRate, setSilverRate] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showNewCustomer, setShowNewCustomer] = useState(false);

  const [formData, setFormData] = useState({
    customerId: '',
    billingType: 'regular',
    silverRate: '',
    gstApplicable: false,
    cgstPercent: 1.5,
    sgstPercent: 1.5,
    paidAmount: 0,
    paidSilver: 0,
    paymentMode: 'cash',
    notes: ''
  });

  const [items, setItems] = useState([{
    description: '',
    pieces: 1,
    grossWeight: '',
    stoneWeight: 0,
    netWeight: '',
    wastage: 0,
    touch: 13.00,
    laborRatePerKg: 500
  }]);

  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    gstNumber: ''
  });

  useEffect(() => {
    fetchSilverRate();
    fetchCustomers();
  }, []);

  const fetchSilverRate = async () => {
    try {
      const response = await api.get('/billing/silver-rate/current');
      if (response.data.success) {
        setSilverRate(response.data.data);
        setFormData(prev => ({
          ...prev,
          silverRate: response.data.data.ratePerGram
        }));
      }
    } catch (error) {
      console.error('Error fetching silver rate:', error);
    }
  };

  const fetchCustomers = async (search = '') => {
    try {
      const response = await api.get(`/billing/customers?search=${search}&limit=100`);
      if (response.data.success) {
        setCustomers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const handleCustomerSelect = (customerId) => {
    const customer = customers.find(c => c.id === parseInt(customerId));
    setSelectedCustomer(customer);
    setFormData(prev => ({ ...prev, customerId }));
  };

  const handleCreateCustomer = async () => {
    try {
      const response = await api.post('/billing/customers', newCustomer);
      if (response.data.success) {
        const customer = response.data.data;
        setCustomers([...customers, customer]);
        setSelectedCustomer(customer);
        setFormData(prev => ({ ...prev, customerId: customer.id }));
        setShowNewCustomer(false);
        setNewCustomer({ name: '', phone: '', email: '', address: '', gstNumber: '' });
        alert('Customer created successfully!');
      }
    } catch (error) {
      console.error('Error creating customer:', error);
      alert('Error creating customer: ' + error.response?.data?.message);
    }
  };

  const handleBillingTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      billingType: type,
      gstApplicable: type === 'wholesale'
    }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;

    if (field === 'grossWeight' || field === 'stoneWeight') {
      const grossWeight = parseFloat(updatedItems[index].grossWeight || 0);
      const stoneWeight = parseFloat(updatedItems[index].stoneWeight || 0);
      updatedItems[index].netWeight = (grossWeight - stoneWeight).toFixed(3);
    }

    setItems(updatedItems);
  };

  const addItem = () => {
    setItems([...items, {
      description: '',
      pieces: 1,
      grossWeight: '',
      stoneWeight: 0,
      netWeight: '',
      wastage: 0,
      touch: 13.00,
      laborRatePerKg: 500
    }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const calculateTotals = () => {
    const silverRateValue = parseFloat(formData.silverRate || 0);

    let totalNetWeight = 0;
    let totalWastage = 0;
    let totalSilverWeight = 0;
    let totalLabor = 0;
    let subtotal = 0;

    items.forEach(item => {
      const grossWeight = parseFloat(item.grossWeight || 0);
      const netWeight = parseFloat(item.netWeight || 0);
      const wastage = parseFloat(item.wastage || 0);
      const touch = parseFloat(item.touch || 0);
      const laborRate = parseFloat(item.laborRatePerKg || 0);

      // NEW FORMULA: Silver = (wastage + touch) × netWeight / 100
      const silverWeight = ((wastage + touch) * netWeight) / 100;

      // NEW FORMULA: Labor = grossWeight × laborRate / 1000
      const labor = (grossWeight * laborRate) / 1000;

      totalNetWeight += netWeight;
      totalWastage += wastage;
      totalSilverWeight += silverWeight;
      totalLabor += labor;

      // NEW FORMULA: Amount = silverWeight × silverRate + labor
      subtotal += (silverWeight * silverRateValue) + labor;
    });

    const cgst = formData.gstApplicable ? (subtotal * formData.cgstPercent / 100) : 0;
    const sgst = formData.gstApplicable ? (subtotal * formData.sgstPercent / 100) : 0;
    const totalAmount = subtotal + cgst + sgst;
    
    const paidSilverValue = parseFloat(formData.paidSilver || 0) * silverRateValue;
    const effectivePaid = parseFloat(formData.paidAmount || 0) + paidSilverValue;
    const balanceAmount = totalAmount - effectivePaid;

    return {
      totalNetWeight: totalNetWeight.toFixed(3),
      totalWastage: totalWastage.toFixed(3),
      totalSilverWeight: totalSilverWeight.toFixed(3),
      totalLabor: totalLabor.toFixed(2),
      subtotal: subtotal.toFixed(2),
      cgst: cgst.toFixed(2),
      sgst: sgst.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
      paidSilverValue: paidSilverValue.toFixed(2),
      effectivePaid: effectivePaid.toFixed(2),
      balanceAmount: balanceAmount.toFixed(2)
    };
  };

  const totals = calculateTotals();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.customerId) {
      alert('Please select a customer');
      return;
    }

    if (items.some(item => !item.description || !item.netWeight)) {
      alert('Please fill all item details');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/billing/sales', {
        ...formData,
        items: items.map(item => ({
          ...item,
          grossWeight: parseFloat(item.grossWeight),
          stoneWeight: parseFloat(item.stoneWeight || 0),
          netWeight: parseFloat(item.netWeight),
          wastage: parseFloat(item.wastage || 0),
          touch: parseFloat(item.touch || 0),
          laborRatePerKg: parseFloat(item.laborRatePerKg || 0),
          pieces: parseInt(item.pieces || 1)
        }))
      });

      if (response.data.success) {
        alert('Sale created successfully!');
        setFormData({
          customerId: '',
          billingType: 'regular',
          silverRate: silverRate?.ratePerGram || '',
          gstApplicable: false,
          cgstPercent: 1.5,
          sgstPercent: 1.5,
          paidAmount: 0,
          paidSilver: 0,
          paymentMode: 'cash',
          notes: ''
        });
        setItems([{
          description: '',
          pieces: 1,
          grossWeight: '',
          stoneWeight: 0,
          netWeight: '',
          wastage: 0,
          touch: 13.00,
          laborRatePerKg: 500
        }]);
        setSelectedCustomer(null);

        if (onSaleCreated) onSaleCreated();
      }
    } catch (error) {
      console.error('Error creating sale:', error);
      alert('Error creating sale: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Billing Type */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg"
      >
        <h3 className="text-lg font-semibold mb-4">Wholesale Billing Type</h3>
        <div className="grid grid-cols-2 gap-4">
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleBillingTypeChange('regular')}
            className={`p-4 rounded-lg border-2 transition-all ${
              formData.billingType === 'regular'
                ? 'border-green-500 bg-green-50 shadow-lg'
                : 'border-gray-300 hover:border-green-300'
            }`}
          >
            <div className="text-3xl mb-2">🧾</div>
            <div className="font-semibold">Wholesale Without GST</div>
            <div className="text-sm text-gray-600">No GST + Silver Return</div>
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleBillingTypeChange('wholesale')}
            className={`p-4 rounded-lg border-2 transition-all ${
              formData.billingType === 'wholesale'
                ? 'border-blue-500 bg-blue-50 shadow-lg'
                : 'border-gray-300 hover:border-blue-300'
            }`}
          >
            <div className="text-3xl mb-2">🏪</div>
            <div className="font-semibold">Wholesale With GST</div>
            <div className="text-sm text-gray-600">With GST (3%) + Silver Return</div>
          </motion.button>
        </div>
      </motion.div>

      {/* Customer Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white p-6 rounded-lg shadow"
      >
        <h3 className="text-lg font-semibold mb-4">Customer Details</h3>

        {!showNewCustomer ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Select Customer</label>
              <select
                value={formData.customerId}
                onChange={(e) => handleCustomerSelect(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
                required
              >
                <option value="">-- Select Customer --</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} - {customer.phone}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => setShowNewCustomer(true)}
              className="text-blue-600 hover:underline text-sm font-medium"
            >
              + Add New Customer
            </button>

            {selectedCustomer && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-gray-50 p-4 rounded-lg"
              >
                <p><strong>Name:</strong> {selectedCustomer.name}</p>
                <p><strong>Phone:</strong> {selectedCustomer.phone}</p>
                <p><strong>Current Balance:</strong> ₹{selectedCustomer.balance}</p>
              </motion.div>
            )}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Customer Name"
                value={newCustomer.name}
                onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                className="p-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
                required
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                className="p-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={newCustomer.email}
                onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                className="p-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
              />
              <input
                type="text"
                placeholder="GST Number"
                value={newCustomer.gstNumber}
                onChange={(e) => setNewCustomer({...newCustomer, gstNumber: e.target.value})}
                className="p-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <textarea
              placeholder="Address"
              value={newCustomer.address}
              onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
              rows="2"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCreateCustomer}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Create Customer
              </button>
              <button
                type="button"
                onClick={() => setShowNewCustomer(false)}
                className="px-6 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Silver Rate */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white p-6 rounded-lg shadow"
      >
        <h3 className="text-lg font-semibold mb-4">Silver Rate</h3>
        <div>
          <label className="block text-sm font-medium mb-2">Silver Rate per Gram (₹)</label>
          <input
            type="number"
            step="0"
            value={formData.silverRate}
            onChange={(e) => setFormData({...formData, silverRate: e.target.value})}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
            required
          />
          {silverRate && (
            <p className="text-sm text-gray-600 mt-1">
              Current Rate: ₹{silverRate.ratePerGram}/gram ({silverRate.date})
            </p>
          )}
        </div>
      </motion.div>

      {/* Items */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white p-6 rounded-lg shadow"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Items</h3>
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={addItem}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Add Item
          </motion.button>
        </div>

        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="border-2 border-gray-200 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-gray-700">Item {index + 1}</h4>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-2">
                  <label className="block text-sm mb-1">Description *</label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    className="w-full p-2 border rounded-lg text-sm"
                    placeholder="e.g., Silver Bracelet"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Pieces</label>
                  <input
                    type="number"
                    value={item.pieces}
                    onChange={(e) => handleItemChange(index, 'pieces', e.target.value)}
                    className="w-full p-2 border rounded-lg text-sm"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Labor Rate/KG (₹)</label>
                  <input
                    type="number"
                    value={item.laborRatePerKg}
                    onChange={(e) => handleItemChange(index, 'laborRatePerKg', e.target.value)}
                    className="w-full p-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Gross Wt (g) *</label>
                  <input
                    type="number"
                    step="0"
                    value={item.grossWeight}
                    onChange={(e) => handleItemChange(index, 'grossWeight', e.target.value)}
                    className="w-full p-2 border rounded-lg text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Stone Wt (g)</label>
                  <input
                    type="number"
                    step="0"
                    value={item.stoneWeight}
                    onChange={(e) => handleItemChange(index, 'stoneWeight', e.target.value)}
                    className="w-full p-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Net Wt (g) *</label>
                  <input
                    type="number"
                    step="0"
                    value={item.netWeight}
                    className="w-full p-2 border rounded-lg text-sm bg-gray-50"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Touch</label>
                  <input
                    type="number"
                    step="0.01"
                    value={item.touch}
                    onChange={(e) => handleItemChange(index, 'touch', e.target.value)}
                    className="w-full p-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Wastage (g)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={item.wastage}
                    onChange={(e) => handleItemChange(index, 'wastage', e.target.value)}
                    className="w-full p-2 border rounded-lg text-sm"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Totals & Payment */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white p-6 rounded-lg shadow"
      >
        <h3 className="text-lg font-semibold mb-4">Totals & Payment</h3>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Total Silver Weight:</span>
              <span className="font-medium text-purple-600">{totals.totalSilverWeight} g</span>
            </div>
            <div className="flex justify-between">
              <span>Total Labor:</span>
              <span className="font-medium">₹{totals.totalLabor}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span>Subtotal:</span>
              <span className="font-medium">₹{totals.subtotal}</span>
            </div>
            {formData.gstApplicable && (
              <>
                <div className="flex justify-between">
                  <span>CGST (1.5%):</span>
                  <span className="font-medium">₹{totals.cgst}</span>
                </div>
                <div className="flex justify-between">
                  <span>SGST (1.5%):</span>
                  <span className="font-medium">₹{totals.sgst}</span>
                </div>
              </>
            )}
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>Total Amount:</span>
              <span className="text-purple-600">₹{totals.totalAmount}</span>
            </div>
          </div>
        </div>

        {/* Payment Options */}
        <div className="border-t pt-4 space-y-4">
          <h4 className="font-semibold text-gray-700">Payment Options</h4>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Paid Amount (₹)</label>
              <input
                type="number"
                step="0.01"
                value={formData.paidAmount}
                onChange={(e) => setFormData({...formData, paidAmount: e.target.value})}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Paid Silver (grams)</label>
              <input
                type="number"
                step="0.001"
                value={formData.paidSilver}
                onChange={(e) => setFormData({...formData, paidSilver: e.target.value})}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="0.000"
              />
              {formData.paidSilver > 0 && (
                <p className="text-xs text-gray-600 mt-1">
                  = ₹{totals.paidSilverValue}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Payment Mode</label>
              <select
                value={formData.paymentMode}
                onChange={(e) => setFormData({...formData, paymentMode: e.target.value})}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="upi">UPI</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex justify-between text-sm mb-2">
              <span>Cash/Card Payment:</span>
              <span className="font-medium">₹{parseFloat(formData.paidAmount || 0).toFixed(2)}</span>
            </div>
            {formData.paidSilver > 0 && (
              <div className="flex justify-between text-sm mb-2">
                <span>Silver Return ({formData.paidSilver}g):</span>
                <span className="font-medium">₹{totals.paidSilverValue}</span>
              </div>
            )}
            <div className="flex justify-between font-bold border-t pt-2">
              <span>Total Paid:</span>
              <span className="text-green-600">₹{totals.effectivePaid}</span>
            </div>
          </div>

          <div className="flex justify-between text-lg font-semibold">
            <span>Balance Amount:</span>
            <span className="text-red-600">₹{totals.balanceAmount}</span>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium mb-2">Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
            rows="3"
            placeholder="Any additional notes..."
          />
        </div>
      </motion.div>

      {/* Submit */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex justify-end"
      >
        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 font-semibold text-lg shadow-lg"
          disabled={loading}
        >
          {loading ? '⏳ Creating Sale...' : '✅ Create Sale'}
        </motion.button>
      </motion.div>
    </form>
  );
}
