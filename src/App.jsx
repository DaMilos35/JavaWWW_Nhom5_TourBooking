import React, { Suspense, lazy } from 'react';
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
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorBoundary from './components/common/ErrorBoundary';
import { PrivateRoute, AdminRoute } from './components/common/PrivateRoute';

// Public & User Pages (Direct imports prevent blank screen flashes when switching pages)
import HomePage from './pages/HomePage';
import TourListPage from './pages/TourListPage';
import TourDetailPage from './pages/TourDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import MyOrdersPage from './pages/MyOrdersPage';
import WishlistPage from './pages/WishlistPage';
import HelpCenterPage from './pages/HelpCenterPage';
import VnPayReturnPage from './pages/VnPayReturnPage';
import NotFoundPage from './pages/NotFoundPage';

// Lazy-loaded Admin Pages (Code-split for admin bundle)
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminTours = lazy(() => import('./pages/admin/AdminTours'));
const AdminTourForm = lazy(() => import('./pages/admin/AdminTourForm'));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminOrderDetail = lazy(() => import('./pages/admin/AdminOrderDetail'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminB2B = lazy(() => import('./pages/admin/AdminB2B'));

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
  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <Router>
              <ScrollToTop />
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

                {/* Private User Routes */}
                <Route path="/wishlist" element={<PrivateRoute><UserLayout><WishlistPage /></UserLayout></PrivateRoute>} />
                <Route path="/checkout" element={<PrivateRoute><UserLayout><CheckoutPage /></UserLayout></PrivateRoute>} />
                <Route path="/profile" element={<PrivateRoute><UserLayout><ProfilePage /></UserLayout></PrivateRoute>} />
                <Route path="/settings" element={<PrivateRoute><UserLayout><ProfilePage /></UserLayout></PrivateRoute>} />
                <Route path="/my-orders" element={<PrivateRoute><UserLayout><MyOrdersPage /></UserLayout></PrivateRoute>} />

                {/* Admin Routes with Suspense fallback */}
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <Suspense fallback={<LoadingSpinner fullScreen text="Đang tải trang quản trị..." />}>
                        <AdminLayout />
                      </Suspense>
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
