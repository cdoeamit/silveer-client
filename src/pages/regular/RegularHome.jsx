import React, { useState, useEffect } from 'react';
import RegularDashboard from './RegularDashboard';
import api from '../../utils/api';

const RegularHome = () => {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalSilver: 0, // Changed
    totalAmount: 0, // Changed
    totalUsers: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Sales count
      const salesResponse = await api.get('/regular-billing/sales');
      const sales = salesResponse.data.data || [];
      const totalSales = sales.length;

      const customersResponse = await api.get('/regular-billing/customers');
    const customers = customersResponse.data.data || [];
    const totalUsers = customers.length;

      // Jama/Kharch Silver
      const silverJamaResponse = await api.get('/regular-jama-kharch/silver?type=JAMA');
      const silverKharchaResponse = await api.get('/regular-jama-kharch/silver?type=KHARCHA');

      const jamaTransactions = silverJamaResponse.data.data || [];
      const kharchaTransactions = silverKharchaResponse.data.data || [];

      const totalJamaSilver = jamaTransactions.reduce(
        (sum, txn) => sum + parseFloat(txn.silverWeight || 0),
        0
      );
      const totalKharchaSilver = kharchaTransactions.reduce(
        (sum, txn) => sum + parseFloat(txn.silverWeight || 0),
        0
      );
      const totalSilver = totalJamaSilver - totalKharchaSilver;

      // Jama/Kharch Cash
      const cashJamaResponse = await api.get('/regular-jama-kharch/cash?type=JAMA');
      const cashKharchaResponse = await api.get('/regular-jama-kharch/cash?type=KHARCHA');

      const jamaCashTransactions = cashJamaResponse.data.data || [];
      const kharchaCashTransactions = cashKharchaResponse.data.data || [];

      const totalJamaAmount = jamaCashTransactions.reduce(
        (sum, txn) => sum + parseFloat(txn.amount || 0),
        0
      );
      const totalKharchaAmount = kharchaCashTransactions.reduce(
        (sum, txn) => sum + parseFloat(txn.amount || 0),
        0
      );
      const totalAmount = totalJamaAmount - totalKharchaAmount;

      setStats({
        totalSales,
        totalSilver,
        totalAmount,
        totalUsers
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const statCards = [
    {
      title: 'Total Sales',
      value: stats.totalSales,
      icon: '📊',
      color: 'blue',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600'
    },
    {
      title: 'Total Silver',
      value: `${stats.totalSilver.toFixed(3)}g`,
      icon: '💎',
      color: 'purple',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600'
    },
    {
      title: 'Total Amount',
      value: `₹${stats.totalAmount.toFixed(2)}`,
      icon: '💰',
      color: 'green',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600'
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: '👤',
      color: 'orange',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-600'
    }
  ];

  return (
    <RegularDashboard>
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Regular Billing Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card, index) => (
            <div
              key={index}
              className={`${card.bgColor} rounded-lg shadow-md p-6 transform transition-all hover:scale-105`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-4xl">{card.icon}</span>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-2">{card.title}</h3>
              <p className={`text-3xl font-bold ${card.textColor}`}>{card.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/regular/billing"
              className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <span className="text-2xl">💰</span>
              <span className="font-medium">Create New Sale</span>
            </a>
            <a
              href="/regular/jama-kharch-silver"
              className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
            >
              <span className="text-2xl">💎</span>
              <span className="font-medium">Jama/Kharch Silver</span>
            </a>
            <a
              href="/regular/jama-kharch-cash"
              className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
            >
              <span className="text-2xl">💵</span>
              <span className="font-medium">Jama/Kharch Cash</span>
            </a>
          </div>
        </div>
      </div>
    </RegularDashboard>
  );
};

export default RegularHome;
