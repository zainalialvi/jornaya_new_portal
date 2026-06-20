import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { token, role, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    if (role === 'admin') return <Navigate to="/admin/companies" replace />;
    if (role === 'supervisor') return <Navigate to="/submissions" replace />;
    if (role === 'user') return <Navigate to="/submit" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;
