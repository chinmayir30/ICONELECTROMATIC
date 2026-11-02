/**
 * Authentication Service for Icon Electromatic Staff
 * Handles Supabase GoTrue Auth via standard browser fetch with local mock fallback,
 * session persistence, and silent JWT token refresh.
 */

const SUPABASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || '';
const SUPABASE_ANON_KEY = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || '';

const SESSION_KEY = 'icon_staff_session';
const TOKEN_KEY = 'icon_staff_token';

export const authService = {
  isConfigured: Boolean(SUPABASE_URL && SUPABASE_ANON_KEY),

  getSession() {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const session = JSON.parse(raw);
      // In production builds where Supabase IS configured, strictly refuse to honor mock tokens
      if (this.isConfigured && session?.access_token?.startsWith('mock_')) {
        return null;
      }
      return session;
    } catch {
      return null;
    }
  },

  isAuthenticated() {
    return Boolean(this.getSession());
  },

  getUser() {
    const session = this.getSession();
    return session ? session.user : null;
  },

  async getValidToken() {
    if (!this.isConfigured) {
      return (typeof localStorage !== 'undefined') ? (localStorage.getItem(TOKEN_KEY) || 'mock_staff_token') : 'mock_staff_token';
    }

    const session = this.getSession();
    if (!session || !session.access_token) return null;

    // Check expiration timestamp (Supabase provides expires_at in seconds, or expires_in)
    const nowSec = Math.floor(Date.now() / 1000);
    const expiresAt = session.expires_at || 0;

    // If token expires within 5 minutes (300s) and refresh_token exists, silently refresh
    if (expiresAt > 0 && (expiresAt - nowSec < 300) && session.refresh_token) {
      try {
        const refreshed = await this.refreshToken(session.refresh_token);
        if (refreshed?.access_token) {
          return refreshed.access_token;
        }
      } catch {
        // Fallback to existing token
      }
    }

    return session.access_token;
  },

  async refreshToken(refreshToken) {
    if (!this.isConfigured || !refreshToken) return null;
    try {
      const url = `${SUPABASE_URL.replace(/\/$/, '')}/auth/v1/token?grant_type=refresh_token`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refresh_token: refreshToken })
      });

      if (!res.ok) {
        return null;
      }

      const data = await res.json();
      if (data.access_token) {
        const nowSec = Math.floor(Date.now() / 1000);
        data.expires_at = data.expires_at || (nowSec + (data.expires_in || 3600));
        localStorage.setItem(SESSION_KEY, JSON.stringify(data));
        localStorage.setItem(TOKEN_KEY, data.access_token);
      }
      return data;
    } catch {
      return null;
    }
  },

  async signIn(email, password) {
    if (!email || !password) {
      throw new Error('Please enter both email and password.');
    }

    // 1. Live Supabase GoTrue endpoint
    if (this.isConfigured) {
      const url = `${SUPABASE_URL.replace(/\/$/, '')}/auth/v1/token?grant_type=password`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error_description || data.msg || 'Invalid login credentials.');
      }

      const nowSec = Math.floor(Date.now() / 1000);
      data.expires_at = data.expires_at || (nowSec + (data.expires_in || 3600));

      localStorage.setItem(SESSION_KEY, JSON.stringify(data));
      localStorage.setItem(TOKEN_KEY, data.access_token);
      return data;
    }

    // 2. Unconfigured Supabase fallback
    // When Supabase credentials are not configured, allow demo staff session
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    const mockSession = {
      access_token: 'mock_staff_token_' + Date.now(),
      user: {
        id: 'mock-user-1',
        email,
        role: 'staff',
        user_metadata: { name: email.split('@')[0] }
      }
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(mockSession));
    localStorage.setItem(TOKEN_KEY, mockSession.access_token);
    return mockSession;
  },

  async signOut() {
    if (this.isConfigured) {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token && !token.startsWith('mock_')) {
        try {
          await fetch(`${SUPABASE_URL.replace(/\/$/, '')}/auth/v1/logout`, {
            method: 'POST',
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${token}`
            }
          });
        } catch {
          // ignore network errors on signout
        }
      }
    }

    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(TOKEN_KEY);
  }
};
