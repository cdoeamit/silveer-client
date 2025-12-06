import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import SaleDetailModal from './SaleDetailModal';

export default function SalesListSection() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  const [filters, setFilters] = useState({
    billingType: '',
    status: '',
    startDate: '',
    endDate: '',
    customerId: ''
  });
  
  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    fetchCustomers();
    fetchSales();
  }, [pagination.page, filters]);

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/billing/customers');
      if (response.data.success) {
        setCustomers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchSales = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      });

      const response = await api.get(`/billing/sales?${params}`);
      if (response.data.success) {
        setSales(response.data.data);
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination.total,
          pages: response.data.pagination.pages
        }));
      }
    } catch (error) {
      console.error('Error fetching sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleExportExcel = async () => {
    try {
      const params = new URLSearchParams(filters);
      const response = await api.get(`/billing/export/sales?${params}`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `sales-${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      alert('Sales exported successfully!');
    } catch (error) {
      console.error('Error exporting:', error);
      alert('Error exporting to Excel: ' + (error.response?.data?.message || error.message));
    }
  };

  const viewSaleDetails = async (saleId) => {
    try {
      const response = await api.get(`/billing/sales/${saleId}`);
      if (response.data.success) {
        setSelectedSale(response.data.data);
        setShowDetailModal(true);
      }
    } catch (error) {
      console.error('Error fetching sale details:', error);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      paid: 'bg-green-100 text-green-800',
      partial: 'bg-yellow-100 text-yellow-800',
      pending: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${styles[status]}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const getBillingTypeBadge = (type) => {
    return type === 'wholesale' ? (
      <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
        🏪 WITH GST
      </span>
    ) : (
      <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
        🏭 WITHOUT GST
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-4 rounded-lg shadow"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">Filters</h3>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExportExcel}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <span>📊</span>
            Export to Excel
          </motion.button>
        </div>

        <div className="grid grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Customer</label>
            <select
              value={filters.customerId}
              onChange={(e) => handleFilterChange('customerId', e.target.value)}
              className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Customers</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Billing Type</label>
            <select
              value={filters.billingType}
              onChange={(e) => handleFilterChange('billingType', e.target.value)}
              className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Types</option>
              <option value="regular">Wholesale Without GST</option>
              <option value="wholesale">Wholesale With GST</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="partial">Partial</option>
              <option value="paid">Paid</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </motion.div>

      {/* Sales Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-lg shadow overflow-hidden"
      >
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent"></div>
            <p className="mt-2 text-gray-600">Loading sales...</p>
          </div>
        ) : sales.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No sales found</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Voucher No.
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Type
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Silver (g)
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Total Amount
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Paid Silver (g)
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Paid Amount (₹)
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Balance
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sales.map((sale, index) => (
                    <motion.tr
                      key={sale.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm font-medium">
                        {sale.voucherNumber}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {new Date(sale.saleDate).toLocaleDateString('en-GB')}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div>
                          <div className="font-medium">{sale.customer.name}</div>
                          <div className="text-gray-500 text-xs">{sale.customer.phone}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {getBillingTypeBadge(sale.billingType)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium text-orange-600">
                        {parseFloat(sale.totalSilverWeight).toFixed(3)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium">
                        ₹{parseFloat(sale.totalAmount).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium text-blue-600">
                        {parseFloat(sale.paidSilver).toFixed(3)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-bold text-green-700">
                        ₹
                        {(
                          parseFloat(sale.paidAmount || 0) -
                          (parseFloat(sale.paidSilver || 0) * parseFloat(sale.silverRate || 0))
                        ).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-red-600 font-medium">
                        ₹{parseFloat(sale.balanceAmount).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {getStatusBadge(sale.status)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => viewSaleDetails(sale.id)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="px-4 py-3 border-t flex items-center justify-between bg-gray-50">
                <div className="text-sm text-gray-700">
                  Page {pagination.page} of {pagination.pages} ({pagination.total} total sales)
                </div>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-white disabled:cursor-not-allowed"
                  >
                    Previous
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page === pagination.pages}
                    className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-white disabled:cursor-not-allowed"
                  >
                    Next
                  </motion.button>
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* Sale Detail Modal */}
      {showDetailModal && selectedSale && (
        <SaleDetailModal
          sale={selectedSale}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedSale(null);
          }}
          onUpdate={fetchSales}
        />
      )}
    </div>
  );
}
