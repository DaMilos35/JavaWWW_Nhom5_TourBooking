import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Layouts
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Pages
import HomePage from './pages/HomePage';
import TourListPage from './pages/TourListPage';
import TourDetailPage from './pages/TourDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import MyOrdersPage from './pages/MyOrdersPage';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminTours from './pages/admin/AdminTours';
import AdminTourForm from './pages/admin/AdminTourForm';
import AdminCategories from './pages/admin/AdminCategories';
import AdminOrders from './pages/admin/AdminOrders';
import AdminOrderDetail from './pages/admin/AdminOrderDetail';
import AdminUsers from './pages/admin/AdminUsers';

// Guards
import { PrivateRoute, AdminRoute } from './components/common/PrivateRoute';

import './App.css';

const UserLayout = ({ children }) => (
  <>
    <Navbar />
    <main style={{ minHeight: '80vh' }}>{children}</main>
    <Footer />
  </>
);

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <ToastContainer position="top-right" autoClose={3000} />
          <Routes>
            {/* Public User Routes */}
            <Route path="/" element={<UserLayout><HomePage /></UserLayout>} />
            <Route path="/tours" element={<UserLayout><TourListPage /></UserLayout>} />
            <Route path="/tours/:id" element={<UserLayout><TourDetailPage /></UserLayout>} />
            <Route path="/cart" element={<UserLayout><CartPage /></UserLayout>} />
            <Route path="/login" element={<UserLayout><LoginPage /></UserLayout>} />
            <Route path="/register" element={<UserLayout><RegisterPage /></UserLayout>} />

            {/* Private User Routes */}
            <Route path="/checkout" element={<PrivateRoute><UserLayout><CheckoutPage /></UserLayout></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><UserLayout><ProfilePage /></UserLayout></PrivateRoute>} />
            <Route path="/my-orders" element={<PrivateRoute><UserLayout><MyOrdersPage /></UserLayout></PrivateRoute>} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="tours" element={<AdminTours />} />
              <Route path="tours/new" element={<AdminTourForm />} />
              <Route path="tours/:id/edit" element={<AdminTourForm />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="orders/:id" element={<AdminOrderDetail />} />
              <Route path="users" element={<AdminUsers />} />
            </Route>
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
