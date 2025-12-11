import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import DashboardStats from '../../components/admin/DashboardStats';
import api from '../../utils/api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    
    try {
      const response = await api.get('/admin/dashboard');
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Overview of your jewelry store</p>
          </div>
          <button
            onClick={() => fetchDashboardStats(true)}
            disabled={refreshing}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 flex items-center space-x-2"
          >
            <span>{refreshing ? '🔄' : '↻'}</span>
            <span>{refreshing ? 'Refreshing...' : 'Refresh Data'}</span>
          </button>
        </div>

        {/* Quick Actions - UPDATED WITH TWO BILLING SYSTEMS */}
        <div className="flex justify-center">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full px-4">

          {/* Wholesale Billing */}
          <Link 
            to="/wholesale"
            className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all hover:scale-105"
          >
            <div className="text-3xl mb-2">🏪</div>
            <h3 className="font-semibold text-lg mb-1">Wholesale</h3>
            <p className="text-purple-100 text-sm">B2B Sales & Silver Returns</p>
          </Link>

          {/* Regular Billing - NEW */}
          <Link 
            to="/regular"
            className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all hover:scale-105"
          >
            <div className="text-3xl mb-2">🛒</div>
            <h3 className="font-semibold text-lg mb-1">Production</h3>
            <p className="text-green-100 text-sm">Retail Sales for Users</p>
          </Link>
        </div>
      </div>

        {/* Category Breakdown */}
        {!loading && stats?.categoryBreakdown && (
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Category Breakdown</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Products
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Total Silver Weight (g)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Avg Weight per Product
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.categoryBreakdown.map((cat) => (
                    <tr key={cat.categoryId} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                          {cat.categoryName}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                        {cat.productCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {cat.totalSilverWeight} g
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {cat.productCount > 0 
                          ? (parseFloat(cat.totalSilverWeight) / cat.productCount).toFixed(2) 
                          : '0.00'} g
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <DashboardStats stats={stats} loading={loading} />
        {/* Quick Actions - UPDATED WITH TWO BILLING SYSTEMS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Products */}
          <Link 
            to="/admin/products"
            className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all hover:scale-105"
          >
            <div className="text-3xl mb-2">📦</div>
            <h3 className="font-semibold text-lg mb-1">Manage Products</h3>
            <p className="text-blue-100 text-sm">Add, edit, or remove products</p>
          </Link>

          {/* Analytics */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all hover:scale-105 cursor-pointer">
            <div className="text-3xl mb-2">📊</div>
            <h3 className="font-semibold text-lg mb-1">View Analytics</h3>
            <p className="text-orange-100 text-sm">Coming Soon</p>
          </div>
        </div>

        
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
