import React, { useState, useEffect } from 'react';
import WholesaleDashboard from './WholesaleDashboard';
import api from '../../utils/api';
import * as XLSX from 'xlsx';

const JamaKharchSilver = () => {
  const [activeTab, setActiveTab] = useState('JAMA');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');  
  const [filteredTransactions, setFilteredTransactions] = useState([]);

  const [fineFormData, setFineFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    silverWeight: '',
    name: '',
    description: ''
  });

  const [rawFormData, setRawFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    formNo: '',
    grossWeight: '',
    touch: '',
    totalSilver: '',
    name: '',
    description: ''
  });

  useEffect(() => {
    fetchTransactions();
  }, [activeTab]);

  useEffect(() => {
    // Filter transactions based on search
    if (searchTerm) {
      const filtered = transactions.filter(txn =>
        txn.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (txn.description && txn.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        txn.date.includes(searchTerm)
      );
      setFilteredTransactions(filtered);
    } else {
      setFilteredTransactions(transactions);
    }
  }, [searchTerm, transactions]);

  // Auto-calculate Total Silver when Gross Weight or Touch changes
  useEffect(() => {
    const grossWeight = parseFloat(rawFormData.grossWeight) || 0;
    const touch = parseFloat(rawFormData.touch) || 0;
    
    if (grossWeight > 0 && touch > 0) {
      const totalSilver = (grossWeight * touch) / 100;
      setRawFormData(prev => ({
        ...prev,
        totalSilver: totalSilver.toFixed(3)
      }));
    }
  }, [rawFormData.grossWeight, rawFormData.touch]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/wholesale-jama-kharch/silver?type=${activeTab}`);
      setTransactions(response.data.data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Excel Export Function
  const exportToExcel = () => {
    const dataToExport = filteredTransactions.map(txn => ({
      'Date': new Date(txn.date).toLocaleDateString(),
      'Type': txn.silverType === 'raw' ? 'Raw' : 'Fine',
      'Silver Weight (g)': txn.silverWeight,
      'Name': txn.name,
      'Description': txn.description || '-',
      'Form No': txn.formNo || '-',
      'Gross Weight': txn.grossWeight || '-',
      'Touch': txn.touch || '-'
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `${activeTab} Silver`);
    XLSX.writeFile(workbook, `Wholesale_${activeTab}_Silver_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleFineSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/wholesale-jama-kharch/silver', {
        ...fineFormData,
        type: activeTab,
        silverType: 'fine'
      });
      
      alert('Transaction saved successfully!');
      setFineFormData({
        date: new Date().toISOString().split('T')[0],
        silverWeight: '',
        name: '',
        description: ''
      });
      fetchTransactions();
    } catch (error) {
      console.error('Error saving transaction:', error);
      alert('Failed to save transaction');
    }
  };

  const handleRawSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/wholesale-jama-kharch/silver', {
        ...rawFormData,
        type: activeTab,
        silverType: 'raw',
        silverWeight: rawFormData.totalSilver
      });
      
      alert('Raw silver transaction saved!');
      setRawFormData({
        date: new Date().toISOString().split('T')[0],
        formNo: '',
        grossWeight: '',
        touch: '',
        totalSilver: '',
        name: '',
        description: ''
      });
      fetchTransactions();
    } catch (error) {
      console.error('Error saving raw silver:', error);
      alert('Failed to save transaction');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    
    try {
      await api.delete(`/wholesale-jama-kharch/silver/${id}`);
      alert('Transaction deleted successfully!');
      fetchTransactions();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Failed to delete transaction');
    }
  };

  return (
    <WholesaleDashboard>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Jama kharcha (Silver)</h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('JAMA')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'JAMA'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            JAMA
          </button>
          <button
            onClick={() => setActiveTab('KHARCHA')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'KHARCHA'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            KHARCHA
          </button>
        </div>

        {/* Fine Silver Form */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Silver /Fine</h3>
          <form onSubmit={handleFineSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                type="date"
                value={fineFormData.date}
                onChange={(e) => setFineFormData({ ...fineFormData, date: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Silver weight</label>
              <input
                type="number"
                step="0.001"
                value={fineFormData.silverWeight}
                onChange={(e) => setFineFormData({ ...fineFormData, silverWeight: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="In grams"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={fineFormData.name}
                onChange={(e) => setFineFormData({ ...fineFormData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <input
                type="text"
                value={fineFormData.description}
                onChange={(e) => setFineFormData({ ...fineFormData, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="col-span-full">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors"
              >
                Save Details
              </button>
            </div>
          </form>
        </div>

        {/* Raw Silver Form */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Raw Silver</h3>
          <form onSubmit={handleRawSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                type="date"
                value={rawFormData.date}
                onChange={(e) => setRawFormData({ ...rawFormData, date: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Form No.</label>
              <input
                type="text"
                value={rawFormData.formNo}
                onChange={(e) => setRawFormData({ ...rawFormData, formNo: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">G Weight</label>
              <input
                type="number"
                step="0.001"
                value={rawFormData.grossWeight}
                onChange={(e) => setRawFormData({ ...rawFormData, grossWeight: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Touch</label>
              <input
                type="number"
                step="0.01"
                value={rawFormData.touch}
                onChange={(e) => setRawFormData({ ...rawFormData, touch: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Total Silver (Auto)</label>
              <input
                type="number"
                step="0.001"
                value={rawFormData.totalSilver}
                readOnly
                className="w-full px-3 py-2 border rounded-lg bg-gray-100 cursor-not-allowed"
                placeholder="Auto-calculated"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Name/Description</label>
              <input
                type="text"
                value={rawFormData.name}
                onChange={(e) => setRawFormData({ ...rawFormData, name: e.target.value, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="col-span-full">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors"
              >
                Save Details
              </button>
            </div>
          </form>
        </div>

        <div className="mt-8 mb-4 flex justify-between items-center">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search by name, description, or date..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={exportToExcel}
            className="ml-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            📊 Export to Excel
          </button>
        </div>
        
        {/* Transaction History */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Transaction History</h3>
          {loading ? (
            <p className="text-center py-4">Loading...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2 text-left">Date</th>
                    <th className="border p-2 text-left">Type</th>
                    <th className="border p-2 text-left">Silver Weight</th>
                    <th className="border p-2 text-left">Name</th>
                    <th className="border p-2 text-left">Description</th>
                    <th className="border p-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="border p-4 text-center text-gray-500">
                        No transactions found
                      </td>
                    </tr>
                  ) : (
                    transactions.map((txn) => (
                      <tr key={txn.id} className="hover:bg-gray-50">
                        <td className="border p-2">{new Date(txn.date).toLocaleDateString()}</td>
                        <td className="border p-2">
                          <span className={`px-2 py-1 rounded text-sm ${
                            txn.silverType === 'raw' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {txn.silverType === 'raw' ? 'Raw' : 'Fine'}
                          </span>
                        </td>
                        <td className="border p-2">{txn.silverWeight}g</td>
                        <td className="border p-2">{txn.name}</td>
                        <td className="border p-2">{txn.description || '-'}</td>
                        <td className="border p-2">
                          <button
                            onClick={() => handleDelete(txn.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            🗑️ Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </WholesaleDashboard>
  );
};

export default JamaKharchSilver;
