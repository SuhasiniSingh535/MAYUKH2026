// API Configuration - determines the correct API URL based on environment

const API_CONFIG = {
  // Auto-detect: use localhost for development, relative path for production
  BASE_URL: window.location.hostname === 'localhost' 
    ? 'http://localhost:5000' 
    : '',

  
  get eventsUrl() {
    return `${this.BASE_URL}/api/events`;
  },
  
  get authUrl() {
    return `${this.BASE_URL}/api/auth`;
  },
  
  get healthUrl() {
    return `${this.BASE_URL}/api/health`;
  }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = API_CONFIG;
}
