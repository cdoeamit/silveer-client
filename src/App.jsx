import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useState, useEffect } from 'react';
import LoadingScreen from './components/LoadingScreen';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import CategoryPage from './pages/CategoryPage';
import ProductDetail from './pages/ProductDetail';
import SearchPage from './pages/SearchPage';
import ProtectedRoute from './pages/ProtectedRoute';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import ProductManagement from './pages/admin/ProductManagement';
import AddProduct from './pages/admin/AddProduct';
import BillingDashboard from './pages/admin/BillingDashboard';
import RegularBillingDashboard from './pages/admin/RegularBillingDashboard'; // NEW

// Wholesale Dashboard Imports
import WholesaleDashboard from './pages/wholesale/WholesaleDashboard';
import WholesaleHome from './pages/wholesale/WholesaleHome';
import WholesaleBilling from './pages/wholesale/WholesaleBilling';
import JamaKharchSilver from './pages/wholesale/JamaKharchSilver';
import JamaKharchCash from './pages/wholesale/JamaKharchCash';

// Regular Dashboard Imports
import RegularDashboard from './pages/regular/RegularDashboard';
import RegularHome from './pages/regular/RegularHome';
import RegularBilling from './pages/regular/RegularBilling';
import RJamaKharchSilver from './pages/regular/JamaKharchSilver';
import RJamaKharchCash from './pages/regular/JamaKharchCash';
import MetalCalculator from './pages/regular/MetalCalculator';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hasSeenLoading = sessionStorage.getItem('hasSeenLoading');
    if (hasSeenLoading) {
      setLoading(false);
    }
  }, []);

  const handleLoadingComplete = () => {
    sessionStorage.setItem('hasSeenLoading', 'true');
    setLoading(false);
  };

  if (loading) {
    return <LoadingScreen onLoadingComplete={handleLoadingComplete} />;
  }

  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <ProtectedRoute adminOnly>
                <ProductManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products/add"
            element={
              <ProtectedRoute adminOnly>
                <AddProduct />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products/edit/:id"
            element={
              <ProtectedRoute adminOnly>
                <AddProduct />
              </ProtectedRoute>
            }
          />

          {/* Wholesale Billing Admin Routes */}
          <Route
            path="/admin/billing"
            element={
              <ProtectedRoute adminOnly>
                <BillingDashboard />
              </ProtectedRoute>
            }
          />

          {/* Regular Billing Admin Routes */}
          <Route
            path="/admin/regular-billing"
            element={
              <ProtectedRoute adminOnly>
                <RegularBillingDashboard />
              </ProtectedRoute>
            }
          />

          {/* Wholesale Dashboard Routes */}
          <Route
            path="/wholesale"
            element={
              <ProtectedRoute adminOnly>
                <WholesaleHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wholesale/billing"
            element={
              <ProtectedRoute adminOnly>
                <WholesaleBilling />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wholesale/jama-kharch-silver"
            element={
              <ProtectedRoute adminOnly>
                <JamaKharchSilver />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wholesale/jama-kharch-cash"
            element={
              <ProtectedRoute adminOnly>
                <JamaKharchCash />
              </ProtectedRoute>
            }
          />

          {/* Regular Dashboard Routes */}
          <Route
            path="/regular"
            element={
              <ProtectedRoute adminOnly>
                <RegularHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/regular/billing"
            element={
              <ProtectedRoute adminOnly>
                <RegularBilling />
              </ProtectedRoute>
            }
          />
          <Route
            path="/regular/jama-kharch-silver"
            element={
              <ProtectedRoute adminOnly>
                <RJamaKharchSilver />
              </ProtectedRoute>
            }
          />
          <Route
            path="/regular/jama-kharch-cash"
            element={
              <ProtectedRoute adminOnly>
                <RJamaKharchCash />
              </ProtectedRoute>
            }
          />
          <Route
            path="/regular/metal-calculator"
            element={
              <ProtectedRoute adminOnly>
                <MetalCalculator />
              </ProtectedRoute>
            }
          />


          {/* Public Pages */}
          <Route
            path="*"
            element={
              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-grow">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/category/:category" element={<CategoryPage />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/search" element={<SearchPage />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
