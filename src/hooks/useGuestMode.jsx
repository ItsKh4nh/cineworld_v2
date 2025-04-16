import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/UserContext";
import toast from "react-hot-toast";

/**
 * Custom hook for managing authentication states and access control
 *
 * Provides utilities to:
 * - Check authentication status
 * - Verify access permissions
 * - Handle restricted features by prompting for authentication when needed
 */
function useGuestMode() {
  const { User, isGuestMode } = useContext(AuthContext);
  const navigate = useNavigate();

  /**
   * Determines if the user is fully authenticated
   * Useful for features that should only be available to registered users
   */
  const isAuthenticated = () => !!User;

  /**
   * Determines if the user has sufficient access to view content
   * Both authenticated users and guests in guest mode have basic viewing access
   */
  const hasAccess = () => !!User || isGuestMode;

  /**
   * Handles attempting to use features that require authentication
   * Shows a toast notification with login prompt when access is denied
   *
   * @param {string} feature - Name of the restricted feature for the error message
   * @returns {boolean} - Whether the user has permission to proceed
   */
  const requireAuth = (feature = "this feature") => {
    if (!User) {
      toast.error(`Please login to use ${feature}`, {
        duration: 3000,
        onClick: () => navigate("/signin"),
      });
      return false;
    }
    return true;
  };

  return {
    isGuestMode,
    isAuthenticated,
    hasAccess,
    requireAuth,
  };
}

export default useGuestMode;
