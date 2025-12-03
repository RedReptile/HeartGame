import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import Game from "./componets/Game";
import Login from "./componets/Login";
import Signup from "./componets/Signup";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in on component mount
  useEffect(() => {
    const userId = localStorage.getItem('user_id') || Cookies.get('user_id');
    if (userId) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  // Handle successful login
  const handleLoginSuccess = (userId) => {
    setIsAuthenticated(true);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('user_id');
    localStorage.removeItem('username');
    Cookies.remove('user_id');
    Cookies.remove('username');
    setIsAuthenticated(false);
    setShowSignup(false);
  };

  // Switch to signup view
  const switchToSignup = () => {
    setShowSignup(true);
  };

  // Switch to login view
  const switchToLogin = () => {
    setShowSignup(false);
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-sm text-neutral-500">
        Loading...
      </div>
    );
  }

  // Show game if authenticated, otherwise show login/signup
  return (
    <div className="min-h-screen bg-white text-neutral-900">
      {isAuthenticated ? (
        <Game onLogout={handleLogout} />
      ) : showSignup ? (
        <Signup 
          onSignupSuccess={handleLoginSuccess} 
          switchToLogin={switchToLogin}
        />
      ) : (
        <Login 
          onLoginSuccess={handleLoginSuccess} 
          switchToSignup={switchToSignup}
        />
      )}
    </div>
  );
}

export default App;
