import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

export default function CreateSale() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [silverRate, setSilverRate] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  
  const [formData, setFormData] = useState({
    customerId: '',
    silverRate: '',
    cgstPercent: 1.5,
    sgstPercent: 1.5,
    paidAmount: 0,
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
    touch: 'S13',
    laborCharges: 0
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
        setNewCustomer({
          name: '',
          phone: '',
          email: '',
          address: '',
          gstNumber: ''
        });
        alert('Customer created successfully!');
      }
    } catch (error) {
      console.error('Error creating customer:', error);
      alert('Error creating customer: ' + error.response?.data?.message);
    }
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;

    // Auto-calculate net weight if gross weight or stone weight changes
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
      touch: 'S13',
      laborCharges: 0
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
    let totalLabor = 0;
    let subtotal = 0;

    items.forEach(item => {
      const netWeight = parseFloat(item.netWeight || 0);
      const wastage = parseFloat(item.wastage || 0);
      const labor = parseFloat(item.laborCharges || 0);
      
      totalNetWeight += netWeight;
      totalWastage += wastage;
      totalLabor += labor;
      
      subtotal += ((netWeight + wastage) * silverRateValue) + labor;
    });

    const cgst = (subtotal * formData.cgstPercent) / 100;
    const sgst = (subtotal * formData.sgstPercent) / 100;
    const totalAmount = subtotal + cgst + sgst;
    const balanceAmount = totalAmount - parseFloat(formData.paidAmount || 0);

    return {
      totalNetWeight: totalNetWeight.toFixed(3),
      totalWastage: totalWastage.toFixed(3),
      totalLabor: totalLabor.toFixed(2),
      subtotal: subtotal.toFixed(2),
      cgst: cgst.toFixed(2),
      sgst: sgst.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
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
          laborCharges: parseFloat(item.laborCharges || 0),
          pieces: parseInt(item.pieces || 1)
        }))
      });

      if (response.data.success) {
        alert('Sale created successfully!');
        navigate(`/admin/sales/${response.data.data.id}`);
      }
    } catch (error) {
      console.error('Error creating sale:', error);
      alert('Error creating sale: ' + error.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Create New Sale/Voucher</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Selection */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Customer Details</h2>
          
          {!showNewCustomer ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Select Customer</label>
                <select
                  value={formData.customerId}
                  onChange={(e) => handleCustomerSelect(e.target.value)}
                  className="w-full p-2 border rounded"
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
                className="text-blue-600 hover:underline text-sm"
              >
                + Add New Customer
              </button>

              {selectedCustomer && (
                <div className="bg-gray-50 p-4 rounded">
                  <p><strong>Name:</strong> {selectedCustomer.name}</p>
                  <p><strong>Phone:</strong> {selectedCustomer.phone}</p>
                  <p><strong>Current Balance:</strong> ₹{selectedCustomer.balance}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Customer Name *"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                  className="p-2 border rounded"
                  required
                />
                <input
                  type="tel"
                  placeholder="Phone Number *"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                  className="p-2 border rounded"
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                  className="p-2 border rounded"
                />
                <input
                  type="text"
                  placeholder="GST Number"
                  value={newCustomer.gstNumber}
                  onChange={(e) => setNewCustomer({...newCustomer, gstNumber: e.target.value})}
                  className="p-2 border rounded"
                />
              </div>
              <textarea
                placeholder="Address"
                value={newCustomer.address}
                onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})}
                className="w-full p-2 border rounded"
                rows="2"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCreateCustomer}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Create Customer
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewCustomer(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Silver Rate */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Silver Rate</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Rate per Gram (₹)</label>
              <input
                type="number"
                step="0.01"
                value={formData.silverRate}
                onChange={(e) => setFormData({...formData, silverRate: e.target.value})}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            {silverRate && (
              <div className="flex items-end">
                <p className="text-sm text-gray-600">
                  Current Rate: ₹{silverRate.ratePerGram}/gram (Date: {silverRate.date})
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Items */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Items</h2>
            <button
              type="button"
              onClick={addItem}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              + Add Item
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="border p-4 rounded">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium">Item {index + 1}</h3>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
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
                      className="w-full p-2 border rounded text-sm"
                      placeholder="e.g., RAJKOT KADA"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Pieces</label>
                    <input
                      type="number"
                      value={item.pieces}
                      onChange={(e) => handleItemChange(index, 'pieces', e.target.value)}
                      className="w-full p-2 border rounded text-sm"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Touch</label>
                    <input
                      type="text"
                      value={item.touch}
                      onChange={(e) => handleItemChange(index, 'touch', e.target.value)}
                      className="w-full p-2 border rounded text-sm"
                      placeholder="S13"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Gross Wt (gm) *</label>
                    <input
                      type="number"
                      step="0.001"
                      value={item.grossWeight}
                      onChange={(e) => handleItemChange(index, 'grossWeight', e.target.value)}
                      className="w-full p-2 border rounded text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Stone Wt (gm)</label>
                    <input
                      type="number"
                      step="0.001"
                      value={item.stoneWeight}
                      onChange={(e) => handleItemChange(index, 'stoneWeight', e.target.value)}
                      className="w-full p-2 border rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Net Wt (gm) *</label>
                    <input
                      type="number"
                      step="0.001"
                      value={item.netWeight}
                      onChange={(e) => handleItemChange(index, 'netWeight', e.target.value)}
                      className="w-full p-2 border rounded text-sm bg-gray-50"
                      required
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Wastage (gm)</label>
                    <input
                      type="number"
                      step="0.001"
                      value={item.wastage}
                      onChange={(e) => handleItemChange(index, 'wastage', e.target.value)}
                      className="w-full p-2 border rounded text-sm"
                    />
                  </div>
                  <div className="col-span-4">
                    <label className="block text-sm mb-1">Labor Charges (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={item.laborCharges}
                      onChange={(e) => handleItemChange(index, 'laborCharges', e.target.value)}
                      className="w-full p-2 border rounded text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Totals & Payment */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Totals & Payment</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Net Weight:</span>
                <span className="font-medium">{totals.totalNetWeight} gm</span>
              </div>
              <div className="flex justify-between">
                <span>Total Wastage:</span>
                <span className="font-medium">{totals.totalWastage} gm</span>
              </div>
              <div className="flex justify-between">
                <span>Total Labor:</span>
                <span className="font-medium">₹{totals.totalLabor}</span>
              </div>
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-medium">₹{totals.subtotal}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>CGST ({formData.cgstPercent}%):</span>
                <span className="font-medium">₹{totals.cgst}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>SGST ({formData.sgstPercent}%):</span>
                <span className="font-medium">₹{totals.sgst}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total Amount:</span>
                <span>₹{totals.totalAmount}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium mb-2">Paid Amount (₹)</label>
              <input
                type="number"
                step="0.01"
                value={formData.paidAmount}
                onChange={(e) => setFormData({...formData, paidAmount: e.target.value})}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Payment Mode</label>
              <select
                value={formData.paymentMode}
                onChange={(e) => setFormData({...formData, paymentMode: e.target.value})}
                className="w-full p-2 border rounded"
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="upi">UPI</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex justify-between text-lg font-semibold mb-4">
              <span>Balance Amount:</span>
              <span className="text-red-600">₹{totals.balanceAmount}</span>
            </div>
            
            {selectedCustomer && selectedCustomer.balance > 0 && (
              <div className="bg-yellow-50 p-3 rounded">
                <p className="text-sm">
                  <strong>Note:</strong> Customer has existing balance of ₹{selectedCustomer.balance}
                </p>
                <p className="text-sm mt-1">
                  New closing balance will be: ₹{(parseFloat(selectedCustomer.balance) + parseFloat(totals.balanceAmount)).toFixed(2)}
                </p>
              </div>
            )}
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full p-2 border rounded"
              rows="3"
              placeholder="Any additional notes..."
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/admin/sales')}
            className="px-6 py-3 bg-gray-300 rounded hover:bg-gray-400"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Sale'}
          </button>
        </div>
      </form>
    </div>
  );
}