import { useContext, useEffect, lazy, Suspense } from "react";
import "./App.css";

const Home = lazy(() => import("./pages/Home"));
const Search = lazy(() => import("./pages/Search"));
const Profile = lazy(() => import("./pages/Profile"));
const MyList = lazy(() => import("./pages/MyList"));
const SignIn = lazy(() => import("./pages/SignIn"));
const SignUp = lazy(() => import("./pages/SignUp"));
const Welcome = lazy(() => import("./pages/Welcome"));
const ErrorPage = lazy(() => import("./pages/ErrorPage"));
const Play = lazy(() => import("./pages/Play"));

import { Routes, Route } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { AuthContext } from "./contexts/UserContext";
import { RatingModalProvider } from "./contexts/RatingModalContext";

import Loading from "./components/Loading/Loading";
import Navbar from "./components/Header/Navbar";
import NavbarWithoutUser from "./components/Header/NavbarWithoutUser";

function App() {
  const { User, setUser } = useContext(AuthContext);
  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      setUser(user);
      console.log(user);
    });
  }, []);

  return (
    <RatingModalProvider>
      <div>
        {User ? <Navbar></Navbar> : <NavbarWithoutUser></NavbarWithoutUser>}
        <Suspense replace fallback={<Loading />}>
          <Routes>
            <Route index path="/" element={User ? <Home /> : <Welcome />} />
            {User ? (
              <>
                <Route path="/home" element={<Home />} />
                <Route path="/search" element={<Search />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/mylist" element={<MyList />} />
                <Route path="/play/:id" element={<Play />} />
              </>
            ) : null}
            <Route path="/play/:id" element={<Play />} />

            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="*" element={<ErrorPage />} />
          </Routes>
        </Suspense>
      </div>
    </RatingModalProvider>
  );
}

export default App;
