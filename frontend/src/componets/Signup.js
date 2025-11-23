// Import React hooks and styles
// virtual identity has username and password with the username and password securly stored using bcrypt hashing
import React, { useState } from 'react';
import './Auth.css';

// Signup component
export default function Signup({ onSignupSuccess, switchToLogin }) {
  // ---------- STATE VARIABLES ----------
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // ---------- HANDLE SIGNUP ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate input
    if (!username.trim() || !password.trim()) {
      setMessage('Please enter both username and password');
      return;
    }

    if (username.trim().length < 3) {
      setMessage('Username must be at least 3 characters long');
      return;
    }

    if (password.length < 6) {
      setMessage('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setMessage('');

    // Create form data
    const formData = new FormData();
    formData.append('username', username.trim());
    formData.append('password', password);

    try {
      // API call to signup endpoint
      const response = await fetch('http://127.0.0.1:8000/api/auth/signup', {
        method: 'POST',
        body: formData
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        // If response is not JSON, use a default error message
        throw new Error('Invalid response from server');
      }

      if (response.ok) {
        setMessage('Account created successfully! Please sign in.');
        
        // Clear form and switch to login after a short delay
        setTimeout(() => {
          setUsername('');
          setPassword('');
          setConfirmPassword('');
          switchToLogin();
        }, 1500);
      } else {
        setMessage(data.detail || 'Signup failed. Please try again.');
      }
    } catch (error) {
      console.error('Signup error:', error);
      setMessage('Error connecting to server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ---------- RENDER THE COMPONENT ----------
  return (
    <div className="auth-container">
      <div className="auth-content">
        <h1 className="auth-title">Sign Up</h1>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)} // input field → triggers state update
              placeholder="Username"
              className="form-input"
              disabled={isLoading}
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)} // input field → triggers state update
              placeholder="Password"
              className="form-input"
              disabled={isLoading}
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)} // input field → triggers state update
              placeholder="Confirm Password"
              className="form-input"
              disabled={isLoading}
              autoComplete="new-password"
            />
          </div>

          {message && (
            <div className={`auth-message ${message.includes('successfully') ? 'auth-message-success' : 'auth-message-error'}`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            className="auth-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="loading-spinner"></span>
              </>
            ) : (
              'Sign Up'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p className="auth-footer-text">
            <button
              type="button"
              onClick={switchToLogin}
              className="auth-link"
              disabled={isLoading}
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

