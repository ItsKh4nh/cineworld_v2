import React from 'react';
import { Navigate } from 'react-router-dom';
import Loading from '../components/Loading/Loading';

/**
 * Route wrapper for public routes that still require either
 * authentication or guest mode to access
 */
const PublicProtectedRoute = ({ children, authLoading, hasAccess }) => {
  if (authLoading) {
    return <Loading />;
  }
  
  if (hasAccess) {
    return children;
  }
  
  return <Navigate to="/welcome" />;
};

export default PublicProtectedRoute; 