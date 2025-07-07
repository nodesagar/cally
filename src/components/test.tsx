// components/AuthTest.tsx
import React, { useState } from 'react';
import { GoogleAuthService } from '../services/google-auth';

export const AuthTest: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);

  const authService = GoogleAuthService.getInstance();

  const handleSignIn = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const tokens = await authService.authenticate();
      console.log('Authentication successful:', tokens);
      setIsAuthenticated(true);
      
      // Get user info
      const user = await authService.getUserInfo();
      setUserInfo(user);
    } catch (err) {
      console.error('Authentication failed:', err);
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    
    try {
      await authService.signOut();
      setIsAuthenticated(false);
      setUserInfo(null);
    } catch (err) {
      console.error('Sign out failed:', err);
      setError(err instanceof Error ? err.message : 'Sign out failed');
    } finally {
      setLoading(false);
    }
  };

  const checkAuthStatus = () => {
    const authenticated = authService.isAuthenticated();
    setIsAuthenticated(authenticated);
    console.log('Authentication status:', authenticated);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Google Calendar Authentication Test</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <p>Status: {isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}</p>
        <button onClick={checkAuthStatus}>Check Auth Status</button>
      </div>

      {error && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#ffebee', 
          color: '#c62828',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          Error: {error}
        </div>
      )}

      {userInfo && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#e8f5e8', 
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          <h3>User Info:</h3>
          <p>Email: {userInfo.email}</p>
          <p>Name: {userInfo.name}</p>
          {userInfo.picture && <img src={userInfo.picture} alt="Profile" style={{ width: '50px', height: '50px', borderRadius: '50%' }} />}
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px' }}>
        {!isAuthenticated ? (
          <button 
            onClick={handleSignIn}
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#4285f4',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Signing In...' : 'Sign In with Google'}
          </button>
        ) : (
          <button 
            onClick={handleSignOut}
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Signing Out...' : 'Sign Out'}
          </button>
        )}
      </div>
    </div>
  );
};