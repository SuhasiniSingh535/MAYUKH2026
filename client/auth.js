// Frontend API helper for authentication
// Dynamically determine API base URL for production/development
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'https://mayukh-bv-1.onrender.com/api' 
  : '/api';

// Sign up a new user
async function signup(name, email, password, role) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, password, role })
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return { success: true, data };
    } else {
      return { success: false, error: data.message || 'Signup failed' };
    }
  } catch (error) {
    console.error('Signup error:', error);
    return { success: false, error: 'Network error. Please try again.' };
  }
}

// Login user
async function login(email, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return { success: true, data };
    } else {
      return { success: false, error: data.message || 'Login failed' };
    }
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Network error. Please try again.' };
  }
}

// Get user profile
async function getProfile() {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;

    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const user = await response.json();
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    } else if (response.status === 401) {
      logout();
      return null;
    }
    return null;
  } catch (error) {
    console.error('Profile fetch error:', error);
    return null;
  }
}

// Logout user
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

// Check if user is logged in
function isLoggedIn() {
  const token = localStorage.getItem('token');
  if (!token) return false;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

// Get current user
function getCurrentUser() {
  if (!isLoggedIn()) {
    logout();
    return null;
  }
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

// Check if user has specific role
function hasRole(requiredRole) {
  const user = getCurrentUser();
  return user && user.role === requiredRole;
}

// Get auth header for API calls
function getAuthHeader() {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}
