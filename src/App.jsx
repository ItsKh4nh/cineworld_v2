import { useContext, useEffect, lazy, Suspense, useState } from "react";
import "./App.css";

const Home = lazy(() => import("./pages/Home"));
const Genre = lazy(() => import("./pages/Genre"));
const Country = lazy(() => import("./pages/Country"));
const Search = lazy(() => import("./pages/Search"));
const Profile = lazy(() => import("./pages/Profile"));
const MyList = lazy(() => import("./pages/MyList"));
const SignIn = lazy(() => import("./pages/SignIn"));
const SignUp = lazy(() => import("./pages/SignUp"));
const Welcome = lazy(() => import("./pages/Welcome"));
const ErrorPage = lazy(() => import("./pages/ErrorPage"));
const Play = lazy(() => import("./pages/Play"));
const People = lazy(() => import("./pages/People"));

import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { AuthContext } from "./contexts/UserContext";
import { RatingModalProvider } from "./contexts/RatingModalContext";
import { UserPreferencesProvider } from "./contexts/UserPreferencesContext";
import { auth } from "./firebase/FirebaseConfig";

import Loading from "./components/Loading/Loading";
import Navbar from "./components/Header/Navbar";
import NavbarWithoutUser from "./components/Header/NavbarWithoutUser";
import SimpleNavbar from "./components/Header/SimpleNavbar";
import MoviePopUp from "./components/PopUp/MoviePopUp";

function App() {
  const { User, setUser, isGuestMode } = useContext(AuthContext);
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

  return (
    <RatingModalProvider>
      <UserPreferencesProvider>
        <div>
          {renderNavbar()}
          <Suspense replace fallback={<Loading />}>
            <Routes>
              {/* Redirect root based on authentication/guest status */}
              <Route path="/" element={authLoading ? <Loading /> : (hasAccess ? <Home /> : <Navigate to="/welcome" />)} />
              
              {/* Welcome page at /welcome */}
              <Route path="/welcome" element={<Welcome />} />
              
              {/* Public routes - accessible to all users */}
              <Route path="/genre/:genreName" element={hasAccess ? <Genre /> : <Navigate to="/welcome" />} />
              <Route path="/country/:countryName" element={hasAccess ? <Country /> : <Navigate to="/welcome" />} />
              <Route path="/search" element={hasAccess ? <Search /> : <Navigate to="/welcome" />} />
              <Route path="/play/:id" element={hasAccess ? <Play /> : <Navigate to="/welcome" />} />
              <Route path="/people/:id" element={hasAccess ? <People /> : <Navigate to="/welcome" />} />
              <Route path="/signin" element={User ? <Navigate to="/" /> : <SignIn />} />
              <Route path="/signup" element={User ? <Navigate to="/" /> : <SignUp />} />
              
              {/* Protected routes - require authentication */}
              <Route path="/profile" element={User ? <Profile /> : <Navigate to="/signin" />} />
              <Route path="/mylist" element={User ? <MyList /> : <Navigate to="/signin" />} />
              
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
