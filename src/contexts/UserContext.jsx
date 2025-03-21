import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext(null);

export default function Context({ children }) {
  const [User, setUser] = useState(null);
  const [isGuestMode, setIsGuestMode] = useState(false);

  const enableGuestMode = () => {
    setIsGuestMode(true);
    localStorage.setItem("guestMode", "true");
    console.log("Guest mode enabled");
  };

  const disableGuestMode = () => {
    setIsGuestMode(false);
    localStorage.removeItem("guestMode");
    console.log("Guest mode disabled");
  };

  // Check for existing user session and guest mode on initial load
  useEffect(() => {
    // Check if guest mode was previously enabled
    const storedGuestMode = localStorage.getItem("guestMode");
    if (storedGuestMode === "true") {
      setIsGuestMode(true);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ User, setUser, isGuestMode, enableGuestMode, disableGuestMode }}>
      {children}
    </AuthContext.Provider>
  );
}
