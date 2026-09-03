// src/utils/auth.js

const TOKEN_KEY = 'ai_gym_token';
const USER_KEY = 'ai_gym_user';

/**
 * Retrieve the JWT token from storage.
 */
export function getAuthToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Persist or clear the JWT token in storage.
 */
export function setAuthToken(token) {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

/**
 * Decode JWT token payload (client-side claims inspection).
 */
export function parseJwt(token) {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

/**
 * Verify whether the JWT token exists and has not expired.
 */
export function isTokenValid(token = getAuthToken()) {
  if (!token) return false;
  const decoded = parseJwt(token);
  if (!decoded || !decoded.exp) return false;
  // exp is in seconds, Date.now() is in milliseconds
  return decoded.exp * 1000 > Date.now();
}

/**
 * Retrieve the currently authenticated user if token is valid.
 */
export function getAuthenticatedUser() {
  if (typeof window === 'undefined') return null;
  const token = getAuthToken();
  if (!isTokenValid(token)) {
    // Expired or missing token
    setAuthToken(null);
    localStorage.removeItem(USER_KEY);
    return null;
  }
  const userStr = localStorage.getItem(USER_KEY);
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (e) {
      return null;
    }
  }
  return null;
}

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

/**
 * User Login with server validation and JWT issuance.
 */
export async function loginUser(email, password) {
  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return { 
        success: false, 
        error: data.message || 'Login failed. Please verify your credentials.' 
      };
    }

    // Persist JWT and user profile
    setAuthToken(data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));

    return { 
      success: true, 
      user: data.user, 
      token: data.token 
    };
  } catch (err) {
    return { 
      success: false, 
      error: 'Unable to connect to authentication server. Please check your network or try again.' 
    };
  }
}

/**
 * User Registration with confirm password validation and JWT issuance.
 */
export async function registerUser({ name, email, password, confirmPassword }) {
  if (password !== confirmPassword) {
    return {
      success: false,
      error: 'Passwords do not match. Please re-enter identical passwords.'
    };
  }

  if (password.length < 6) {
    return {
      success: false,
      error: 'Password must be at least 6 characters long.'
    };
  }

  try {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, confirmPassword })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return { 
        success: false, 
        error: data.message || 'Registration failed. Please check your details.' 
      };
    }

    // Persist JWT and user profile
    setAuthToken(data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));

    return { 
      success: true, 
      user: data.user, 
      token: data.token 
    };
  } catch (err) {
    return { 
      success: false, 
      error: 'Unable to connect to registration server. Please try again.' 
    };
  }
}

/**
 * Logout current user and wipe session tokens.
 */
export function logoutUser() {
  setAuthToken(null);
  if (typeof window !== 'undefined') {
    localStorage.removeItem(USER_KEY);
  }
}
