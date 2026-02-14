const getAPIBaseURL = () => {
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5001/api';
  }
  return 'https://mayukh-bv-1.onrender.com/api';
};

const API_BASE_URL = getAPIBaseURL();

function setAdminSession() {
  localStorage.setItem("admin_logged_in", "true");
  localStorage.setItem("admin_login_time", new Date().getTime());
}

function clearAdminSession() {
  localStorage.removeItem("admin_logged_in");
  localStorage.removeItem("admin_login_time");
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

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
      setAdminSession();
      return { success: true, data };
    } else {
      return { success: false, error: data.message || 'Signup failed' };
    }
  } catch (error) {
    console.error('Signup error:', error);
    return { success: false, error: 'Network error. Please try again.' };
  }
}

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
      setAdminSession();
      return { success: true, data };
    } else {
      return { success: false, error: data.message || 'Login failed' };
    }
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Network error. Please try again.' };
  }
}

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
      clearAdminSession();
      return null;
    }
    return null;
  } catch (error) {
    console.error('Profile fetch error:', error);
    return null;
  }
}

function logout() {
  clearAdminSession();
}

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

function getCurrentUser() {
  if (!isLoggedIn()) {
    clearAdminSession();
    return null;
  }
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

function hasRole(requiredRole) {
  const user = getCurrentUser();
  return user && user.role === requiredRole;
}

function getAuthHeader() {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}
