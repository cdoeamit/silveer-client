import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';

export default function CreateRegularSale({ onSaleCreated }) {
  const [loading, setLoading] = useState(false);
  const [silverRate, setSilverRate] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    address: ''
  });
  
  const [formData, setFormData] = useState({
    regularCustomerId: '',
    silverRate: '',
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
      const response = await api.get(`/regular-billing/customers?search=${search}&limit=100`);
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
    setFormData(prev => ({ ...prev, regularCustomerId: customerId }));
  };

  const handleAddNewCustomer = async () => {
  if (!newCustomer.name.trim()) {
    alert('Customer name is required');
    return;
  }

  try {
    const response = await api.post('/regular-billing/customers', {
      name: newCustomer.name.trim(),
      phone: newCustomer.phone.trim(),
      address: newCustomer.address.trim()
    });
    
    if (response.data.success) {
      const addedCustomer = response.data.data;
      
      alert(`Customer "${addedCustomer.name}" added successfully!`);
      
      // Reset form
      setNewCustomer({ name: '', phone: '', address: '' });
      setShowAddCustomerModal(false);
      
      // Fetch updated customer list
      const updatedResponse = await api.get('/regular-billing/customers?limit=100');
      if (updatedResponse.data.success) {
        setCustomers(updatedResponse.data.data);
        
        // Auto-select the new customer
        setFormData(prev => ({ ...prev, regularCustomerId: String(addedCustomer.id) }));
        setSelectedCustomer(addedCustomer);
      }
    }
  } catch (error) {
    console.error('Error adding customer:', error);
    
    // Handle duplicate customer error
    if (error.response?.status === 409) {
      alert('Customer already exists! Please select from the dropdown.');
      setShowAddCustomerModal(false);
      
      // Optionally auto-select the existing customer
      if (error.response?.data?.data) {
        const existingCustomer = error.response.data.data;
        setFormData(prev => ({ ...prev, regularCustomerId: String(existingCustomer.id) }));
        setSelectedCustomer(existingCustomer);
      }
    } else {
      alert('Error adding customer: ' + (error.response?.data?.message || error.message));
    }
  }
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
      
      const silverWeight = ((wastage + touch) * netWeight) / 100;
      const labor = (grossWeight * laborRate) / 1000;
      
      totalNetWeight += netWeight;
      totalWastage += wastage;
      totalSilverWeight += silverWeight;
      totalLabor += labor;
      
      subtotal += (silverWeight * silverRateValue) + labor;
    });

    const totalAmount = subtotal;
    const paidSilverValue = parseFloat(formData.paidSilver || 0) * silverRateValue;
    const effectivePaid = parseFloat(formData.paidAmount || 0) + paidSilverValue;
    const balanceAmount = totalAmount - effectivePaid;

    return {
      totalNetWeight: totalNetWeight.toFixed(3),
      totalWastage: totalWastage.toFixed(3),
      totalSilverWeight: totalSilverWeight.toFixed(3),
      totalLabor: totalLabor.toFixed(2),
      subtotal: subtotal.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
      paidSilverValue: paidSilverValue.toFixed(2),
      effectivePaid: effectivePaid.toFixed(2),
      balanceAmount: balanceAmount.toFixed(2)
    };
  };

  const totals = calculateTotals();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.regularCustomerId) {
      alert('Please select a customer');
      return;
    }

    if (items.some(item => !item.description || !item.netWeight)) {
      alert('Please fill all item details');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/regular-billing/sales', {
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
          regularCustomerId: '',
          silverRate: silverRate?.ratePerGram || '',
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
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg shadow"
        >
          <h3 className="text-lg font-semibold mb-4">Customer Details</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Select Customer</label>
              <select
                value={formData.regularCustomerId}
                onChange={(e) => handleCustomerSelect(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="">-- Select Customer --</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} - {customer.phone || 'No Phone'}
                  </option>
                ))}
              </select>
            </div>

            {/* Add New Customer Button */}
            <div>
              <button
                type="button"
                onClick={() => setShowAddCustomerModal(true)}
                className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1"
              >
                <span className="text-lg">+</span> Add New Customer
              </button>
            </div>

            {selectedCustomer && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-gray-50 p-4 rounded-lg"
              >
                <p><strong>Name:</strong> {selectedCustomer.name}</p>
                <p><strong>Phone:</strong> {selectedCustomer.phone || 'N/A'}</p>
                <p><strong>Address:</strong> {selectedCustomer.address || 'N/A'}</p>
                <p><strong>Current Balance:</strong> ₹{selectedCustomer.balance || '0.00'}</p>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Silver Rate */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
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
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
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
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-lg shadow"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Items</h3>
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={addItem}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              + Add Item
            </motion.button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border-2 border-gray-200 p-4 rounded-lg hover:border-green-300 transition-colors"
              >
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
                      className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500"
                      placeholder="e.g., Silver Ring"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Pieces</label>
                    <input
                      type="number"
                      value={item.pieces}
                      onChange={(e) => handleItemChange(index, 'pieces', e.target.value)}
                      className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Labor Rate/KG (₹)</label>
                    <input
                      type="number"
                      step="0"
                      value={item.laborRatePerKg}
                      onChange={(e) => handleItemChange(index, 'laborRatePerKg', e.target.value)}
                      className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Gross Wt (g) *</label>
                    <input
                      type="number"
                      step="0"
                      value={item.grossWeight}
                      onChange={(e) => handleItemChange(index, 'grossWeight', e.target.value)}
                      className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500"
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
                      className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Net Wt (g) *</label>
                    <input
                      type="number"
                      step="0"
                      value={item.netWeight}
                      className="w-full p-2 border rounded-lg text-sm bg-gray-50"
                      required
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Touch</label>
                    <input
                      type="number"
                      step="0"
                      value={item.touch}
                      onChange={(e) => handleItemChange(index, 'touch', e.target.value)}
                      className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Wastage (g)</label>
                    <input
                      type="number"
                      step="0"
                      value={item.wastage}
                      onChange={(e) => handleItemChange(index, 'wastage', e.target.value)}
                      className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>

                <div className="mt-3 p-2 bg-green-50 rounded text-sm">
                  <strong>Silver Weight:</strong> {
                    (((parseFloat(item.wastage || 0) + parseFloat(item.touch || 0)) * parseFloat(item.netWeight || 0)) / 100).toFixed(3)
                  } g
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Totals & Payment */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-lg shadow"
        >
          <h3 className="text-lg font-semibold mb-4">Totals & Payment</h3>
          
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Net Weight:</span>
                <span className="font-medium">{totals.totalNetWeight} g</span>
              </div>
              <div className="flex justify-between">
                <span>Total Silver Weight:</span>
                <span className="font-medium text-green-600">{totals.totalSilverWeight} g</span>
              </div>
              <div className="flex justify-between">
                <span>Total Labor:</span>
                <span className="font-medium">₹{totals.totalLabor}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total Amount:</span>
                <span className="text-green-600">₹{totals.totalAmount}</span>
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
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
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
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
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
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
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
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
              rows="3"
              placeholder="Any additional notes..."
            />
          </div>
        </motion.div>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex justify-end"
        >
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 font-semibold text-lg shadow-lg"
            disabled={loading}
          >
            {loading ? '⏳ Creating Sale...' : '✅ Create Sale'}
          </motion.button>
        </motion.div>
      </form>

      {/* Add New Customer Modal */}
      <AnimatePresence>
        {showAddCustomerModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddCustomerModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-4">Add New Customer</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name *</label>
                  <input
                    type="text"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Enter customer name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input
                    type="text"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Address</label>
                  <textarea
                    value={newCustomer.address}
                    onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                    rows="3"
                    placeholder="Enter address"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddNewCustomer}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Add Customer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
