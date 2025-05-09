import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Auth from "./components/Auth";
import Inbox from "./components/Inbox";
import Cookies from "js-cookie";

const App = () => {
  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!Cookies.get("token");
  };

  // Protected route component
  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated()) {
      return <Navigate to="/auth" replace />;
    }
    return children;
  };

  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route 
          path="/inbox" 
          element={
            <ProtectedRoute>
              <Inbox />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/" 
          element={
            isAuthenticated() ? 
            <Navigate to="/inbox" replace /> : 
            <Navigate to="/auth" replace />
          } 
        />
      </Routes>
    </Router>
  );
};

export default App;