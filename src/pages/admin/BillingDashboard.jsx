import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CreateSaleSection from '../../components/billing/CreateSaleSection';
import SalesListSection from '../../components/billing/SalesListSection';
import CustomersSection from '../../components/billing/CustomersSection';
import SilverRatesSection from '../../components/billing/SilverRatesSection';
import DailyAnalysisSection from '../../components/billing/DailyAnalysisSection'; // NEW
import api from '../../utils/api';

const BillingDashboard = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/billing/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const tabs = [
    { id: 'create', label: '🧾 Create Sale', icon: '➕' },
    { id: 'daily', label: '📅 Daily Analysis', icon: '📊' }, // NEW
    { id: 'sales', label: '📋 Sales List', icon: '📄' },
    { id: 'customers', label: '👥 Customers', icon: '👤' },
    { id: 'rates', label: '💰 Silver Rates', icon: '📈' }
  ];

  return (
  
      <div className="space-y-6">
        {/* Header with Stats */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg p-6 text-white"
        >
          <h1 className="text-3xl font-bold mb-4">Wholesale Billing System</h1>
          
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <motion.div whileHover={{ scale: 1.05 }} className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                <p className="text-sm opacity-90">Total Sales</p>
                <p className="text-2xl font-bold">{stats.totalSales}</p>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                <p className="text-sm opacity-90">Sales Amount</p>
                <p className="text-2xl font-bold">₹{parseFloat(stats.totalSalesAmount).toLocaleString()}</p>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                <p className="text-sm opacity-90">Total Silver</p>
                <p className="text-2xl font-bold">{parseFloat(stats.totalSilverWeight || 0).toFixed(2)} g</p>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                <p className="text-sm opacity-90">Pending Balance</p>
                <p className="text-2xl font-bold">₹{parseFloat(stats.pendingBalance).toLocaleString()}</p>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                <p className="text-sm opacity-90">Total Customers</p>
                <p className="text-2xl font-bold">{stats.totalCustomers}</p>
              </motion.div>
            </div>
          )}
        </motion.div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="flex border-b overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-6 py-4 font-semibold transition-all duration-300 relative whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-purple-600'
                    : 'text-gray-600 hover:text-purple-500 hover:bg-gray-50'
                }`}
              >
                <span className="text-2xl mr-2">{tab.icon}</span>
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-purple-600"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === 'create' && <CreateSaleSection onSaleCreated={fetchStats} />}
                {activeTab === 'daily' && <DailyAnalysisSection />}
                {activeTab === 'sales' && <SalesListSection />}
                {activeTab === 'customers' && <CustomersSection />}
                {activeTab === 'rates' && <SilverRatesSection />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
  
  );
};

export default BillingDashboard;
