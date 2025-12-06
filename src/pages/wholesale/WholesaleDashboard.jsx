import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const WholesaleDashboard = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/wholesale',
      icon: '📊'
    },
    {
      name: 'Billing',
      path: '/wholesale/billing',
      icon: '💰'
    },
    {
      name: 'Jama/Kharch (Silver)',
      path: '/wholesale/jama-kharch-silver',
      icon: '💎'
    },
    {
      name: 'Jama/Kharch (Amount)',
      path: '/wholesale/jama-kharch-cash',
      icon: '💵'
    }
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside 
        className={`bg-gradient-to-b from-blue-900 to-blue-800 text-white transition-all duration-300 ${
          isSidebarOpen ? 'w-64' : 'w-20'
        } flex flex-col`}
      >
        <div className="p-4 flex-1">
          <div className="flex items-center justify-between mb-8">
            <h2 className={`text-xl font-bold ${!isSidebarOpen && 'hidden'}`}>
              Wholesale Billing
            </h2>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
            >
              {isSidebarOpen ? '◀' : '▶'}
            </button>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  location.pathname === item.path
                    ? 'bg-blue-700 text-white shadow-lg'
                    : 'hover:bg-blue-700/50'
                }`}
              >
                <span className="text-2xl">{item.icon}</span>
                {isSidebarOpen && <span className="font-medium">{item.name}</span>}
              </Link>
            ))}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="p-4 border-t border-blue-700">
          <Link
            to="/admin"
            className="flex items-center gap-3 p-3 hover:bg-blue-700/50 rounded-lg transition-colors mb-2"
          >
            <span className="text-2xl">🏠</span>
            {isSidebarOpen && <span>Back to Admin</span>}
          </Link>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 hover:bg-red-600 rounded-lg transition-colors"
          >
            <span className="text-2xl">🚪</span>
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default WholesaleDashboard;
