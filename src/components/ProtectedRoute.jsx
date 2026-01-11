import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { PageLoader } from './LoadingSpinner';

const ProtectedRoute = ({ children, requireSuperAdmin = false }) => {
  const { isAuthenticated, loading, isSuperAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireSuperAdmin && !isSuperAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
