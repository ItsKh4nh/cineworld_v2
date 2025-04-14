import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Loading from "../components/Loading/Loading";

// Route protectors
import AuthProtectedRoute from "./AuthProtectedRoute";
import PublicProtectedRoute from "./PublicProtectedRoute";

// Lazy loaded components
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

const AppRoutes = ({ authLoading, hasAccess, user, hasInteractions }) => {
  return (
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
        
        {/* Welcome and authentication pages */}
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
        
        {/* Public routes - accessible to logged in users and guest mode */}
        <Route 
          path="/genre/:genreName" 
          element={
            <PublicProtectedRoute authLoading={authLoading} hasAccess={hasAccess}>
              <Genre />
            </PublicProtectedRoute>
          } 
        />
        <Route 
          path="/country/:countryName" 
          element={
            <PublicProtectedRoute authLoading={authLoading} hasAccess={hasAccess}>
              <Country />
            </PublicProtectedRoute>
          } 
        />
        <Route 
          path="/search" 
          element={
            <PublicProtectedRoute authLoading={authLoading} hasAccess={hasAccess}>
              <Search />
            </PublicProtectedRoute>
          } 
        />
        <Route 
          path="/play/:id" 
          element={
            <PublicProtectedRoute authLoading={authLoading} hasAccess={hasAccess}>
              <Play />
            </PublicProtectedRoute>
          } 
        />
        <Route 
          path="/people/:id" 
          element={
            <PublicProtectedRoute authLoading={authLoading} hasAccess={hasAccess}>
              <People />
            </PublicProtectedRoute>
          } 
        />
        
        {/* Protected routes - require authentication */}
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
              {hasInteractions ? <Recommendations /> : <Navigate to="/" />}
            </AuthProtectedRoute>
          } 
        />
        
        {/* Catch-all error page */}
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes; 