import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

// Layouts & Common
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import AiChatWidget from './components/common/AiChatWidget';
import ScrollToTop from './components/common/ScrollToTop';
import ErrorBoundary from './components/common/ErrorBoundary';
import OmniSearchModal from './components/common/OmniSearchModal';
import { PrivateRoute, AdminRoute } from './components/common/PrivateRoute';

// Public & User Pages (Direct imports prevent blank screen flashes when switching pages)
import HomePage from './pages/HomePage';
import TourListPage from './pages/TourListPage';
import TourDetailPage from './pages/TourDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ProfilePage from './pages/ProfilePage';
import MyOrdersPage from './pages/MyOrdersPage';
import WishlistPage from './pages/WishlistPage';
import HelpCenterPage from './pages/HelpCenterPage';
import VnPayReturnPage from './pages/VnPayReturnPage';
import NotFoundPage from './pages/NotFoundPage';

// Admin Pages (Direct imports prevent dynamic import chunk failures and blank screen flashes)
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminTours from './pages/admin/AdminTours';
import AdminTourForm from './pages/admin/AdminTourForm';
import AdminCategories from './pages/admin/AdminCategories';
import AdminOrders from './pages/admin/AdminOrders';
import AdminOrderDetail from './pages/admin/AdminOrderDetail';
import AdminUsers from './pages/admin/AdminUsers';
import AdminB2B from './pages/admin/AdminB2B';
import AdminArchitectureGraph from './pages/admin/AdminArchitectureGraph';
import AdminDesignCanvas from './pages/admin/AdminDesignCanvas';

import './App.css';

const UserLayout = ({ children }) => (
  <>
    <Navbar />
    <main style={{ minHeight: '80vh' }}>{children}</main>
    <Footer />
    <AiChatWidget />
  </>
);

function App() {
  const [isOmniOpen, setIsOmniOpen] = React.useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOmniOpen((prev) => !prev);
      }
    };
    const handleCustomEvent = () => setIsOmniOpen(true);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('open-omni-search', handleCustomEvent);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-omni-search', handleCustomEvent);
    };
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <Router>
              <ScrollToTop />
              <OmniSearchModal isOpen={isOmniOpen} onClose={() => setIsOmniOpen(false)} />
              <ToastContainer position="top-right" autoClose={3000} />
              <Routes>
                {/* Public User Routes */}
                <Route path="/" element={<UserLayout><HomePage /></UserLayout>} />
                <Route path="/tours" element={<UserLayout><TourListPage /></UserLayout>} />
                <Route path="/tours/:id" element={<UserLayout><TourDetailPage /></UserLayout>} />
                <Route path="/cart" element={<UserLayout><CartPage /></UserLayout>} />
                <Route path="/help" element={<UserLayout><HelpCenterPage /></UserLayout>} />
                <Route path="/payment/vnpay-return" element={<UserLayout><VnPayReturnPage /></UserLayout>} />
                <Route path="/vnpay/return" element={<UserLayout><VnPayReturnPage /></UserLayout>} />
                <Route path="/login" element={<UserLayout><LoginPage /></UserLayout>} />
                <Route path="/register" element={<UserLayout><RegisterPage /></UserLayout>} />
                <Route path="/forgot-password" element={<UserLayout><ForgotPasswordPage /></UserLayout>} />
                <Route path="/reset-password" element={<UserLayout><ForgotPasswordPage /></UserLayout>} />

                {/* Private User Routes */}
                <Route path="/wishlist" element={<PrivateRoute><UserLayout><WishlistPage /></UserLayout></PrivateRoute>} />
                <Route path="/checkout" element={<PrivateRoute><UserLayout><CheckoutPage /></UserLayout></PrivateRoute>} />
                <Route path="/profile" element={<PrivateRoute><UserLayout><ProfilePage /></UserLayout></PrivateRoute>} />
                <Route path="/settings" element={<PrivateRoute><UserLayout><ProfilePage /></UserLayout></PrivateRoute>} />
                <Route path="/my-orders" element={<PrivateRoute><UserLayout><MyOrdersPage /></UserLayout></PrivateRoute>} />

                {/* Admin Routes */}
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminLayout />
                    </AdminRoute>
                  }
                >
                  <Route index element={<AdminDashboard />} />
                  <Route path="tours" element={<AdminTours />} />
                  <Route path="tours/new" element={<AdminTourForm />} />
                  <Route path="tours/:id/edit" element={<AdminTourForm />} />
                  <Route path="categories" element={<AdminCategories />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="orders/:id" element={<AdminOrderDetail />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="b2b" element={<AdminB2B />} />
                  <Route path="architecture" element={<AdminArchitectureGraph />} />
                  <Route path="design-canvas" element={<AdminDesignCanvas />} />
                </Route>

                {/* Catch-all 404 Route: Prevents Blank Screens on Unmatched Paths */}
                <Route path="*" element={<UserLayout><NotFoundPage /></UserLayout>} />
              </Routes>
            </Router>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
