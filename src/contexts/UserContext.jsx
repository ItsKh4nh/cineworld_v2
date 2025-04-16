import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext(null);

export default function Context({ children }) {
  // State declarations
  const [User, setUser] = useState(null);
  const [isGuestMode, setIsGuestMode] = useState(false);

  /**
   * Enable guest mode functionality for users without accounts
   * Persists this setting to localStorage for session persistence
   */
  const enableGuestMode = () => {
    setIsGuestMode(true);
    localStorage.setItem("guestMode", "true");
  };

  /**
   * Disable guest mode, typically used when a user signs in
   * Removes the setting from localStorage
   */
  const disableGuestMode = () => {
    setIsGuestMode(false);
    localStorage.removeItem("guestMode");
  };

  // Initialize state from persisted settings
  useEffect(() => {
    // Restore guest mode setting if it was previously enabled
    const storedGuestMode = localStorage.getItem("guestMode");
    if (storedGuestMode === "true") {
      setIsGuestMode(true);
    }
  }, []);

  // Provide authentication state and functions to the application
  return (
    <AuthContext.Provider
      value={{ User, setUser, isGuestMode, enableGuestMode, disableGuestMode }}
    >
      {children}
    </AuthContext.Provider>
  );
}
