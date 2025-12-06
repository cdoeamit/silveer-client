import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const AuthForm = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    gender: ''
  });

  const { login, signup, logout } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await login(formData.email, formData.password);
      
      // Auto-route based on role
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userData = {
        ...formData,
        role: 'user'
      };
      
      const user = await signup(userData);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phone: '',
      gender: ''
    });
    setError('');
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        backgroundImage: 'url(/silver-jewelry-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Animated Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/70 to-black/80 animate-gradient"></div>
      
      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="particle particle-1"></div>
        <div className="particle particle-2"></div>
        <div className="particle particle-3"></div>
        <div className="particle particle-4"></div>
        <div className="particle particle-5"></div>
      </div>

      <div className="max-w-md w-full relative z-10 animate-fadeInUp">
        {/* Logo */}
        <div className="text-center mb-8 animate-fadeInDown">
          <div className="inline-block animate-bounce-slow">
            <div className="text-6xl mb-2 filter drop-shadow-glow">👑</div>
          </div>
          <h1 className="text-5xl font-bold text-white mb-2 tracking-wider drop-shadow-lg animate-slideInLeft">
            ARGENTUM
          </h1>
          <p className="text-gray-300 text-lg animate-slideInRight">Silver Grace Jewelry</p>
        </div>

        {/* Form Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 animate-scaleIn">
          {/* Tab Navigation */}
          <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => {
                setActiveTab('login');
                resetForm();
              }}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-300 transform ${
                activeTab === 'login'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg scale-105'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => {
                setActiveTab('signup');
                resetForm();
              }}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-300 transform ${
                activeTab === 'signup'
                  ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg scale-105'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Title with Icon */}
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">
              {activeTab === 'login' && '🔐'}
              {activeTab === 'signup' && '✨'}
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              {activeTab === 'login' && 'Welcome Back'}
              {activeTab === 'signup' && 'Join the Family'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {activeTab === 'login' && 'Sign in to continue'}
              {activeTab === 'signup' && 'Create your account'}
            </p>
          </div>

          {/* Error Message with Animation */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg animate-shake">
              <div className="flex items-center">
                <span className="text-xl mr-2">⚠️</span>
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Login Form */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="form-group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📧 Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                  placeholder="you@example.com"
                />
              </div>

              <div className="form-group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  🔒 Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Logging in...
                  </span>
                ) : (
                  'LOG IN'
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('signup');
                    resetForm();
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-all"
                >
                  Don't have an account? Sign Up →
                </button>
              </div>
            </form>
          )}

          {/* Signup Form */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    👤 First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                    placeholder="John"
                  />
                </div>

                <div className="form-group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📧 Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                  placeholder="you@example.com"
                />
              </div>

              <div className="form-group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  🔒 Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                  placeholder="••••••••"
                />
                <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
              </div>

              <div className="form-group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📱 Phone (Optional)
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                  placeholder="+1 234 567 8900"
                />
              </div>

              {/* Gender Selection with Icons */}
              <div className="form-group">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  ⚧ Gender
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <label className={`flex flex-col items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                    formData.gender === 'male' 
                      ? 'border-blue-500 bg-blue-50 shadow-md scale-105' 
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }`}>
                    <input
                      type="radio"
                      name="gender"
                      value="male"
                      checked={formData.gender === 'male'}
                      onChange={handleChange}
                      required
                      className="sr-only"
                    />
                    <span className="text-3xl mb-1">👨</span>
                    <span className="text-sm font-semibold">Male</span>
                  </label>

                  <label className={`flex flex-col items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                    formData.gender === 'female' 
                      ? 'border-pink-500 bg-pink-50 shadow-md scale-105' 
                      : 'border-gray-200 hover:border-pink-300 hover:bg-gray-50'
                  }`}>
                    <input
                      type="radio"
                      name="gender"
                      value="female"
                      checked={formData.gender === 'female'}
                      onChange={handleChange}
                      required
                      className="sr-only"
                    />
                    <span className="text-3xl mb-1">👩</span>
                    <span className="text-sm font-semibold">Female</span>
                  </label>

                  <label className={`flex flex-col items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                    formData.gender === 'other' 
                      ? 'border-purple-500 bg-purple-50 shadow-md scale-105' 
                      : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                  }`}>
                    <input
                      type="radio"
                      name="gender"
                      value="other"
                      checked={formData.gender === 'other'}
                      onChange={handleChange}
                      required
                      className="sr-only"
                    />
                    <span className="text-3xl mb-1">🧑</span>
                    <span className="text-sm font-semibold">Other</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl font-bold hover:from-green-700 hover:to-green-800 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {loading ? 'Creating Account...' : 'CREATE ACCOUNT'}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    resetForm();
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-all"
                >
                  ← Already have an account? Log In
                </button>
              </div>
            </form>
          )}

        
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
