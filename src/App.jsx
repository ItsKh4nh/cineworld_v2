import { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import "./App.css";

// Contexts
import { AuthContext } from "./contexts/UserContext";
import { RatingModalProvider } from "./contexts/RatingModalContext";
import { UserPreferencesProvider } from "./contexts/UserPreferencesContext";

// Firebase
import { auth } from "./firebase/FirebaseConfig";

// Components
import Navbar from "./components/Header/Navbar";
import NavbarWithoutUser from "./components/Header/NavbarWithoutUser";
import SimpleNavbar from "./components/Header/SimpleNavbar";
import MoviePopUp from "./components/PopUp/MoviePopUp";

// Hooks
import useHasInteractions from "./hooks/useHasInteractions";

// Routes
import AppRoutes from "./routes/AppRoutes";

function App() {
  const { User, setUser, isGuestMode } = useContext(AuthContext);
  const location = useLocation();
  const [authLoading, setAuthLoading] = useState(true);
  const { hasInteractions, loading: interactionsLoading } = useHasInteractions();
  
  // Set up authentication state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setAuthLoading(false);
    });
    
    // Clean up subscription on unmount
    return () => unsubscribe();
  }, [setUser]);

  // Check if user has access to main content
  const hasAccess = User || isGuestMode;
  
  // Determine which navbar to show
  const renderNavbar = () => {
    // On Welcome page, show simplified navbar
    if (location.pathname === '/welcome') {
      return <SimpleNavbar />;
    }
    
    // On other pages, show appropriate navbar based on auth
    return User ? <Navbar /> : <NavbarWithoutUser />;
  };

  return (
    <RatingModalProvider>
      <UserPreferencesProvider>
        <div>
          {renderNavbar()}
          <AppRoutes 
            authLoading={authLoading}
            hasAccess={hasAccess}
            user={User}
            hasInteractions={hasInteractions}
          />
          <MoviePopUp />
        </div>
      </UserPreferencesProvider>
    </RatingModalProvider>
  );
}

export default App;
