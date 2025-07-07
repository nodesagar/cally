// services/google-auth.ts
import { GOOGLE_CALENDAR_CONFIG, GOOGLE_CALENDAR_ENDPOINTS } from '../config/google-calendar';
import { AuthTokens } from '../types/calendar';

/**
 * Google OAuth 2.0 Authentication Service for Client-Side Applications
 * Uses Google Identity Services (GIS) with proper error handling
 */
export class GoogleAuthService {
  private static instance: GoogleAuthService;
  private tokens: AuthTokens | null = null;
  private gisLoaded = false;

  private constructor() {
    this.loadStoredTokens();
  }

  public static getInstance(): GoogleAuthService {
    if (!GoogleAuthService.instance) {
      GoogleAuthService.instance = new GoogleAuthService();
    }
    return GoogleAuthService.instance;
  }

  /**
   * Loads Google Identity Services library with better error handling
   */
  private async loadGoogleIdentityServices(): Promise<void> {
    if (this.gisLoaded) return;

    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (window.google?.accounts) {
        this.gisLoaded = true;
        resolve();
        return;
      }

      // Load the Google Identity Services library
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        // Wait a bit for Google to initialize
        setTimeout(() => {
          if (window.google?.accounts) {
            this.gisLoaded = true;
            resolve();
          } else {
            reject(new Error('Google Identity Services failed to initialize'));
          }
        }, 100);
      };
      script.onerror = () => {
        reject(new Error('Failed to load Google Identity Services'));
      };
      document.head.appendChild(script);
    });
  }

  /**
   * Initiates OAuth 2.0 authorization flow using Google Identity Services
   */
  public async authenticate(): Promise<AuthTokens> {
    try {
      await this.loadGoogleIdentityServices();

      return new Promise((resolve, reject) => {
        if (!window.google?.accounts?.oauth2) {
          reject(new Error('Google Identity Services not available'));
          return;
        }

        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CALENDAR_CONFIG.clientId,
          scope: GOOGLE_CALENDAR_CONFIG.scopes.join(' '),
          callback: (response: any) => {
            if (response.error) {
              console.error('OAuth error:', response);
              reject(new Error(`Authentication failed: ${response.error} - ${response.error_description || 'Unknown error'}`));
              return;
            }

            if (!response.access_token) {
              reject(new Error('No access token received'));
              return;
            }

            const tokens: AuthTokens = {
              access_token: response.access_token,
              token_type: response.token_type || 'Bearer',
              expiry_date: Date.now() + ((response.expires_in || 3600) * 1000),
              scope: response.scope
            };

            this.tokens = tokens;
            this.storeTokens(tokens);
            resolve(tokens);
          },
          error_callback: (error: any) => {
            console.error('OAuth error callback:', error);
            reject(new Error(`Authentication error: ${error.type || error.message || 'Unknown error'}`));
          }
        });

        // Request access token with prompt to ensure fresh consent
        client.requestAccessToken({
          prompt: 'consent'
        });
      });
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  }

  /**
   * Alternative popup authentication method
   */
  public async authenticateWithPopup(): Promise<AuthTokens> {
    try {
      await this.loadGoogleIdentityServices();

      return new Promise((resolve, reject) => {
        if (!window.google?.accounts?.oauth2) {
          reject(new Error('Google Identity Services not available'));
          return;
        }

        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CALENDAR_CONFIG.clientId,
          scope: GOOGLE_CALENDAR_CONFIG.scopes.join(' '),
          ux_mode: 'popup',
          callback: (response: any) => {
            if (response.error) {
              console.error('OAuth popup error:', response);
              reject(new Error(`Authentication failed: ${response.error} - ${response.error_description || 'Unknown error'}`));
              return;
            }

            if (!response.access_token) {
              reject(new Error('No access token received'));
              return;
            }

            const tokens: AuthTokens = {
              access_token: response.access_token,
              token_type: response.token_type || 'Bearer',
              expiry_date: Date.now() + ((response.expires_in || 3600) * 1000),
              scope: response.scope
            };

            this.tokens = tokens;
            this.storeTokens(tokens);
            resolve(tokens);
          },
          error_callback: (error: any) => {
            console.error('OAuth popup error callback:', error);
            reject(new Error(`Authentication error: ${error.type || error.message || 'Unknown error'}`));
          }
        });

        client.requestAccessToken();
      });
    } catch (error) {
      console.error('Popup authentication error:', error);
      throw error;
    }
  }

  /**
   * Checks if current tokens are valid and not expired
   */
  public isAuthenticated(): boolean {
    if (!this.tokens?.access_token) return false;
    
    if (this.tokens.expiry_date) {
      // Add 5 minute buffer before expiry
      return Date.now() < (this.tokens.expiry_date - 5 * 60 * 1000);
    }
    
    return true;
  }

  /**
   * Gets current access token, re-authenticating if necessary
   */
  public async getValidAccessToken(): Promise<string> {
    if (!this.tokens?.access_token) {
      throw new Error('Not authenticated. Please sign in first.');
    }

    // Check if token is expired or about to expire
    if (this.tokens.expiry_date && Date.now() >= (this.tokens.expiry_date - 5 * 60 * 1000)) {
      console.log('Token expired, re-authenticating...');
      await this.authenticate();
    }

    return this.tokens.access_token;
  }

  /**
   * Revokes tokens and signs out user
   */
  public async signOut(): Promise<void> {
    if (this.tokens?.access_token) {
      try {
        // Revoke the token
        await fetch(`https://oauth2.googleapis.com/revoke?token=${this.tokens.access_token}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });
      } catch (error) {
        console.warn('Failed to revoke token:', error);
      }
    }

    this.tokens = null;
    this.clearStoredTokens();
  }

  /**
   * Gets current user information
   */
  public async getUserInfo(): Promise<{ email: string; name: string; picture?: string }> {
    const accessToken = await this.getValidAccessToken();
    
    const response = await fetch(GOOGLE_CALENDAR_ENDPOINTS.USER_INFO, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user information: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Stores tokens securely in localStorage
   */
  private storeTokens(tokens: AuthTokens): void {
    try {
      const encrypted = btoa(JSON.stringify(tokens));
      localStorage.setItem('chronosync_auth_tokens', encrypted);
    } catch (error) {
      console.error('Failed to store tokens:', error);
    }
  }

  /**
   * Loads stored tokens from localStorage
   */
  private loadStoredTokens(): void {
    try {
      const stored = localStorage.getItem('chronosync_auth_tokens');
      if (stored) {
        const decrypted = atob(stored);
        const tokens = JSON.parse(decrypted);
        
        // Validate token structure
        if (tokens.access_token && tokens.expiry_date) {
          this.tokens = tokens;
        } else {
          console.warn('Invalid stored tokens, clearing...');
          this.clearStoredTokens();
        }
      }
    } catch (error) {
      console.error('Failed to load stored tokens:', error);
      this.clearStoredTokens();
    }
  }

  /**
   * Clears stored tokens from localStorage
   */
  private clearStoredTokens(): void {
    localStorage.removeItem('chronosync_auth_tokens');
  }
}

// Extend the Window interface to include Google Identity Services
declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: any) => any;
          revoke: (token: string) => Promise<void>;
        };
      };
    };
  }
}