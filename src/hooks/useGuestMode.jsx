import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/UserContext';
import toast from 'react-hot-toast';

/**
 * Custom hook for handling guest mode functionality
 * Provides utilities for checking if user is in guest mode and handling restricted actions
 */
function useGuestMode() {
  const { User, isGuestMode } = useContext(AuthContext);
  const navigate = useNavigate();

  /**
   * Checks if user has full access (is authenticated)
   * @returns {boolean} True if user is authenticated
   */
  const isAuthenticated = () => !!User;

  /**
   * Checks if user has at least guest access
   * @returns {boolean} True if user is authenticated or in guest mode
   */
  const hasAccess = () => !!User || isGuestMode;

  /**
   * Prompts user to login if they're not authenticated
   * Useful for features that require authentication
   * @param {string} feature - The name of the feature requiring authentication
   */
  const requireAuth = (feature = 'this feature') => {
    if (!User) {
      toast.error(`Please login to use ${feature}`, {
        duration: 3000,
        onClick: () => navigate('/signin')
      });
      return false;
    }
    return true;
  };

  return {
    isGuestMode,
    isAuthenticated,
    hasAccess,
    requireAuth
  };
}

export default useGuestMode; 