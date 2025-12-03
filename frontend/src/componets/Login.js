// Import React hooks and styles
import React, { useState } from 'react';
import Cookies from 'js-cookie';
import './Auth.css';

// Login component
export default function Login({ onLoginSuccess, switchToSignup }) {
  // ---------- STATE VARIABLES ----------
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // ---------- HANDLE LOGIN ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate input
    if (!username.trim() || !password.trim()) {
      setMessage('Please enter both username and password');
      return;
    }

    setIsLoading(true);
    setMessage('');

    // Create form data
    const formData = new FormData();
    formData.append('username', username.trim());
    formData.append('password', password);

    try {
      // API call to login endpoint
      const response = await fetch('http://127.0.0.1:8000/api/auth/login', {
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
        // Store user_id in localStorage
        if (data.user_id) {
          const normalizedUsername = username.trim();
          localStorage.setItem('user_id', data.user_id.toString());
          localStorage.setItem('username', normalizedUsername);
          Cookies.set('user_id', data.user_id.toString(), { expires: 7 });
          Cookies.set('username', normalizedUsername, { expires: 7 });
        }
        
        setMessage('Login successful! Redirecting...');
        
        // Call success callback after a short delay
        setTimeout(() => {
          onLoginSuccess(data.user_id);
        }, 500);
      } else {
        setMessage(data.detail || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage('Error connecting to server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ---------- RENDER THE COMPONENT ----------
  return (
    <div className="auth-container">
      <div className="auth-content">
        <h1 className="auth-title">Sign In</h1>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="form-input"
              disabled={isLoading}
              autoComplete="current-password"
            />
          </div>

          {message && (
            <div className={`auth-message ${message.includes('successful') ? 'auth-message-success' : 'auth-message-error'}`}>
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
              'Sign In'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p className="auth-footer-text">
            <button
              type="button"
              onClick={switchToSignup}
              className="auth-link"
              disabled={isLoading}
            >
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

