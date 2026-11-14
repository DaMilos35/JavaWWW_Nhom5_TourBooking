import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  return isAuthenticated ? (
    children
  ) : (
    <Navigate to="/login" replace state={{ from: location }} />
  );
};

export const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, isStaff, user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const role = String(user?.role || '').replace(/^ROLE_/, '').trim().toUpperCase();
  const hasAccess = (typeof isStaff === 'function' && isStaff()) || (typeof isAdmin === 'function' && isAdmin()) || role === 'PROVIDER' || role === 'ADMIN';

  return hasAccess ? (
    children
  ) : (
    <Navigate to="/" replace />
  );
};
