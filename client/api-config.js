<<<<<<< HEAD
=======
// API Configuration - determines the correct API URL based on environment

>>>>>>> cacb304b89ff9a7114f80afc0a20b2e02c8ac57c
const API_CONFIG = {
  // Fix: Check for BOTH 'localhost' AND '127.0.0.1'
  BASE_URL: (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5001' 
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
if (typeof module !== 'undefined') {
  module.exports = API_CONFIG;
}