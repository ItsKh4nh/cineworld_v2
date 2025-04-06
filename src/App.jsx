import { useContext, useEffect, lazy, Suspense, useState } from "react";
import "./App.css";

const Home = lazy(() => import("./Pages/Home"));
const Genre = lazy(() => import("./Pages/Genre"));
const Country = lazy(() => import("./Pages/Country"));
const Search = lazy(() => import("./Pages/Search"));
const Profile = lazy(() => import("./Pages/Profile"));
const MyList = lazy(() => import("./pages/MyList"));
const SignIn = lazy(() => import("./pages/SignIn"));
const SignUp = lazy(() => import("./pages/SignUp"));
const Welcome = lazy(() => import("./pages/Welcome"));
const ErrorPage = lazy(() => import("./pages/ErrorPage"));
const Play = lazy(() => import("./pages/Play"));
const People = lazy(() => import("./pages/People"));
const Recommendations = lazy(() => import("./pages/Recommendations"));

import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { AuthContext } from "./contexts/UserContext";
import { RatingModalProvider } from "./contexts/RatingModalContext";
import { UserPreferencesProvider } from "./contexts/UserPreferencesContext";
import { auth } from "./firebase/FirebaseConfig";
import useHasInteractions from "./hooks/useHasInteractions";

import Loading from "./components/Loading/Loading";
import Navbar from "./components/Header/Navbar";
import NavbarWithoutUser from "./components/Header/NavbarWithoutUser";
import SimpleNavbar from "./components/Header/SimpleNavbar";
import MoviePopUp from "./components/PopUp/MoviePopUp";

function App() {
  const { User, setUser, isGuestMode } = useContext(AuthContext);
  const { hasInteractions, loading: interactionsLoading } = useHasInteractions();
  const location = useLocation();
  const [authLoading, setAuthLoading] = useState(true);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setAuthLoading(false);
      console.log(user);
    });
    
    // Clean up subscription on unmount
    return () => unsubscribe();
  }, []);

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

  // Create a wrapper component to handle auth loading state
  const AuthProtectedRoute = ({ children }) => {
    if (authLoading) {
      return <Loading />;
    }
    
    if (User) {
      return children;
    }
    
    return <Navigate to="/signin" />;
  };
  
  // Create a route wrapper that prevents access if not logged in or in guest mode
  const PublicProtectedRoute = ({ children }) => {
    if (authLoading) {
      return <Loading />;
    }
    
    if (hasAccess) {
      return children;
    }
    
    return <Navigate to="/welcome" />;
  };

  return (
    <RatingModalProvider>
      <UserPreferencesProvider>
        <div>
          {renderNavbar()}
          <Suspense fallback={<Loading />}>
            <Routes>
              {/* Home page */}
              <Route 
                path="/" 
                element={
                  authLoading ? (
                    <Loading />
                  ) : hasAccess ? (
                    <Home />
                  ) : (
                    <Navigate to="/welcome" />
                  )
                } 
              />
              
              {/* Welcome page */}
              <Route path="/welcome" element={<Welcome />} />
              
              {/* Auth pages */}
              <Route 
                path="/signin" 
                element={
                  authLoading ? <Loading /> : User ? <Navigate to="/" /> : <SignIn />
                } 
              />
              <Route 
                path="/signup" 
                element={
                  authLoading ? <Loading /> : User ? <Navigate to="/" /> : <SignUp />
                } 
              />
              
              {/* Public routes - accessible to logged in users and guest mode */}
              <Route 
                path="/genre/:genreName" 
                element={
                  <PublicProtectedRoute>
                    <Genre />
                  </PublicProtectedRoute>
                } 
              />
              <Route 
                path="/country/:countryName" 
                element={
                  <PublicProtectedRoute>
                    <Country />
                  </PublicProtectedRoute>
                } 
              />
              <Route 
                path="/search" 
                element={
                  <PublicProtectedRoute>
                    <Search />
                  </PublicProtectedRoute>
                } 
              />
              <Route 
                path="/play/:id" 
                element={
                  <PublicProtectedRoute>
                    <Play />
                  </PublicProtectedRoute>
                } 
              />
              <Route 
                path="/people/:id" 
                element={
                  <PublicProtectedRoute>
                    <People />
                  </PublicProtectedRoute>
                } 
              />
              
              {/* Protected routes - require authentication */}
              <Route 
                path="/profile" 
                element={
                  <AuthProtectedRoute>
                    <Profile />
                  </AuthProtectedRoute>
                } 
              />
              <Route 
                path="/mylist" 
                element={
                  <AuthProtectedRoute>
                    <MyList />
                  </AuthProtectedRoute>
                } 
              />
              <Route 
                path="/recommendations" 
                element={
                  <AuthProtectedRoute>
                    {hasInteractions ? <Recommendations /> : <Navigate to="/" />}
                  </AuthProtectedRoute>
                } 
              />
              
              <Route path="*" element={<ErrorPage />} />
            </Routes>
          </Suspense>
          <MoviePopUp />
        </div>
      </UserPreferencesProvider>
    </RatingModalProvider>
  );
}

export default App;
