import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/admin', label: 'Dashboard', icon: '📊', exact: true }, // Added exact: true
    { path: '/admin/products', label: 'Products', icon: '💎' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/admin" className="flex items-center space-x-3">
              <span className="text-3xl">👑</span>
              <div>
                <span className="text-xl font-bold text-gray-900">ARGENTUM</span>
                <span className="ml-2 px-2 py-1 bg-purple-600 text-white text-xs font-bold rounded">
                  ADMIN
                </span>
              </div>
            </Link>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 hidden sm:block">
                Welcome, <strong className="text-gray-900">{user?.firstName}</strong>
              </span>
              <Link
                to="/"
                className="px-4 py-2 text-sm border-2 border-gray-300 text-gray-700 rounded-lg hover:border-blue-500 hover:text-blue-500 transition-all"
              >
                View Store
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-lg min-h-[calc(100vh-4rem)]">
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => {
              // FIXED: Proper active state logic
              const isActive = item.exact 
                ? location.pathname === item.path  // Exact match for Dashboard
                : location.pathname.startsWith(item.path); // Starts with for others
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className="font-semibold">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 mt-auto border-t border-gray-200">
            <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
              <p className="text-xs text-gray-600 mb-2">Quick Stats</p>
              <p className="text-sm font-bold text-gray-900">Admin Panel v2.0</p>
              <p className="text-xs text-purple-600 mt-2 font-medium">✨ Dual Billing System</p>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
