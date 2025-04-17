import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Loading from "../components/Loading/Loading";

// Route protection components
import AuthProtectedRoute from "./AuthProtectedRoute";
import PublicProtectedRoute from "./PublicProtectedRoute";

// Lazy loaded components to improve initial load performance
const Home = lazy(() => import("../Pages/Home"));
const Genre = lazy(() => import("../Pages/Genre"));
const Country = lazy(() => import("../Pages/Country"));
const Search = lazy(() => import("../Pages/Search"));
const Profile = lazy(() => import("../Pages/Profile"));
const MyList = lazy(() => import("../Pages/MyList"));
const SignIn = lazy(() => import("../Pages/SignIn"));
const SignUp = lazy(() => import("../Pages/SignUp"));
const Welcome = lazy(() => import("../Pages/Welcome"));
const ErrorPage = lazy(() => import("../Pages/ErrorPage"));
const Play = lazy(() => import("../Pages/Play"));
const People = lazy(() => import("../Pages/People"));
const Recommendations = lazy(() => import("../Pages/Recommendations"));

/**
 * Main application routing component that handles route protection and navigation
 *
 * @param {boolean} authLoading - Indicates if authentication state is still loading
 * @param {boolean} hasAccess - Indicates if user has access (either logged in or in guest mode)
 * @param {object} user - User information if authenticated
 * @param {boolean} hasInteractions - Indicates if user has made enough interactions for recommendations
 */
const AppRoutes = ({ authLoading, hasAccess, user, hasInteractions }) => {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        {/* Landing route - redirects to welcome page if no access */}
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

        {/* Onboarding routes - available to users without accounts */}
        <Route path="/welcome" element={<Welcome />} />
        <Route
          path="/signin"
          element={
            authLoading ? <Loading /> : user ? <Navigate to="/" /> : <SignIn />
          }
        />
        <Route
          path="/signup"
          element={
            authLoading ? <Loading /> : user ? <Navigate to="/" /> : <SignUp />
          }
        />

        {/* Content browsing routes - accessible to both authenticated users and guests */}
        <Route
          path="/genre/:genreName"
          element={
            <PublicProtectedRoute
              authLoading={authLoading}
              hasAccess={hasAccess}
            >
              <Genre />
            </PublicProtectedRoute>
          }
        />
        <Route
          path="/country/:countryName"
          element={
            <PublicProtectedRoute
              authLoading={authLoading}
              hasAccess={hasAccess}
            >
              <Country />
            </PublicProtectedRoute>
          }
        />
        <Route
          path="/search"
          element={
            <PublicProtectedRoute
              authLoading={authLoading}
              hasAccess={hasAccess}
            >
              <Search />
            </PublicProtectedRoute>
          }
        />
        <Route
          path="/play/:id"
          element={
            <PublicProtectedRoute
              authLoading={authLoading}
              hasAccess={hasAccess}
            >
              <Play />
            </PublicProtectedRoute>
          }
        />
        <Route
          path="/play/:id-:slug"
          element={
            <PublicProtectedRoute
              authLoading={authLoading}
              hasAccess={hasAccess}
            >
              <Play />
            </PublicProtectedRoute>
          }
        />
        <Route
          path="/people/:id"
          element={
            <PublicProtectedRoute
              authLoading={authLoading}
              hasAccess={hasAccess}
            >
              <People />
            </PublicProtectedRoute>
          }
        />
        <Route
          path="/people/:id-:slug"
          element={
            <PublicProtectedRoute
              authLoading={authLoading}
              hasAccess={hasAccess}
            >
              <People />
            </PublicProtectedRoute>
          }
        />

        {/* User-specific routes - require full authentication */}
        <Route
          path="/profile"
          element={
            <AuthProtectedRoute authLoading={authLoading} user={user}>
              <Profile />
            </AuthProtectedRoute>
          }
        />
        <Route
          path="/mylist"
          element={
            <AuthProtectedRoute authLoading={authLoading} user={user}>
              <MyList />
            </AuthProtectedRoute>
          }
        />
        <Route
          path="/recommendations"
          element={
            <AuthProtectedRoute authLoading={authLoading} user={user}>
              {/* Only show recommendations if user has sufficient interaction history */}
              {hasInteractions ? <Recommendations /> : <Navigate to="/" />}
            </AuthProtectedRoute>
          }
        />

        {/* Fallback for unknown routes */}
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
