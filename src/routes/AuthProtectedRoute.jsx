import React from 'react';
import { Navigate } from 'react-router-dom';
import Loading from '../components/Loading/Loading';

/**
 * Route wrapper that requires authentication
 * Redirects to sign in if not authenticated
 */
const AuthProtectedRoute = ({ children, authLoading, user }) => {
  if (authLoading) {
    return <Loading />;
  }
  
  if (user) {
    return children;
  }
  
  return <Navigate to="/signin" />;
};

export default AuthProtectedRoute; 