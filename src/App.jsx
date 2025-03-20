import { useContext, useEffect, lazy, Suspense } from "react";
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
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { AuthContext } from "./contexts/UserContext";
import { RatingModalProvider } from "./contexts/RatingModalContext";
import { UserPreferencesProvider } from "./contexts/UserPreferencesContext";

import Loading from "./components/Loading/Loading";
import Navbar from "./components/Header/Navbar";
import NavbarWithoutUser from "./components/Header/NavbarWithoutUser";
import SimpleNavbar from "./components/Header/SimpleNavbar";
import MoviePopUp from "./components/PopUp/MoviePopUp";

function App() {
  const { User, setUser, isGuestMode } = useContext(AuthContext);
  const location = useLocation();
  
  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      setUser(user);
      console.log(user);
    });
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
              <Route path="/" element={hasAccess ? <Home /> : <Navigate to="/welcome" />} />
              
              {/* Welcome page at /welcome */}
              <Route path="/welcome" element={<Welcome />} />
              
              {/* Public routes - accessible to all users */}
              <Route path="/genre/:genreName" element={<Genre />} />
              <Route path="/country/:countryName" element={<Country />} />
              <Route path="/search" element={<Search />} />
              <Route path="/play/:id" element={<Play />} />
              <Route path="/people/:id" element={<People />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              
              {/* Protected routes - require authentication */}
              {User && (
                <>
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/mylist" element={<MyList />} />
                </>
              )}
              
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
