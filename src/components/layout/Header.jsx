import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useState } from 'react';

const Header = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isActivePath = (path) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-2xl">👑</div>
            <span className="text-2xl font-bold text-gray-900">ARGENTUM</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/category/ladies"
              className={`nav-link text-gray-700 hover:text-green-600 font-medium transition ${
                isActivePath('/category/ladies') ? 'active text-green-600' : ''
              }`}
            >
              LADIES
            </Link>
            <Link
              to="/category/gents"
              className={`nav-link text-gray-700 hover:text-green-600 font-medium transition ${
                isActivePath('/category/gents') ? 'active text-green-600' : ''
              }`}
            >
              GENTS
            </Link>
            <Link
              to="/category/lords"
              className={`nav-link text-gray-700 hover:text-green-600 font-medium transition ${
                isActivePath('/category/lords') ? 'active text-green-600' : ''
              }`}
            >
              LORDS
            </Link>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="hidden lg:block">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-64 px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  🔍
                </button>
              </div>
            </form>

            {user ? (
              <>
                <span className="text-sm text-gray-600 hidden sm:block">
                  Welcome, {user.firstName}
                </span>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
              >
                LOGIN
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-4">
          <div className="flex space-x-4 mb-3">
            <Link
              to="/category/ladies"
              className={`nav-link text-sm font-medium ${
                isActivePath('/category/ladies') ? 'active text-green-600' : 'text-gray-700'
              }`}
            >
              LADIES
            </Link>
            <Link
              to="/category/gents"
              className={`nav-link text-sm font-medium ${
                isActivePath('/category/gents') ? 'active text-green-600' : 'text-gray-700'
              }`}
            >
              GENTS
            </Link>
            <Link
              to="/category/lords"
              className={`nav-link text-sm font-medium ${
                isActivePath('/category/lords') ? 'active text-green-600' : 'text-gray-700'
              }`}
            >
              LORDS
            </Link>
          </div>
          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="lg:hidden">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </form>
        </div>
      </div>
    </header>
  );
};

export default Header;