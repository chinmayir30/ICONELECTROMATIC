/**
 * Authentication Service for Icon Electromatic Staff
 * Handles Supabase GoTrue Auth via standard browser fetch with local mock fallback.
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const SESSION_KEY = 'icon_staff_session';
const TOKEN_KEY = 'icon_staff_token';

export const authService = {
  isConfigured: Boolean(SUPABASE_URL && SUPABASE_ANON_KEY),

  getSession() {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const session = JSON.parse(raw);
      // In production builds, refuse to honor mock tokens
      if (!import.meta.env.DEV && session?.access_token?.startsWith('mock_')) {
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

      localStorage.setItem(SESSION_KEY, JSON.stringify(data));
      localStorage.setItem(TOKEN_KEY, data.access_token);
      return data;
    }

    // 2. Unconfigured Supabase check
    // In production builds, fail loudly and refuse to sign in
    if (!import.meta.env.DEV) {
      throw new Error('Supabase is not configured.');
    }

    // 3. Demo / Preview mode fallback (ONLY when import.meta.env.DEV)
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
      if (token) {
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
