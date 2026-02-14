const API_CONFIG = (() => {
    const hostname = window.location.hostname;
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168') || hostname.startsWith('10.');
    const baseUrl = isLocal ? 'http://localhost:5001' : 'https://mayukh-bv-1.onrender.com';
    
    return {
        BASE_URL: baseUrl,
        get API_BASE() { return `${this.BASE_URL}/api`; },
        get eventsUrl() { return `${this.API_BASE}/events`; },
        get teamsUrl() { return `${this.API_BASE}/teams`; },
        get galleryUrl() { return `${this.API_BASE}/gallery`; },
        get alertsUrl() { return `${this.API_BASE}/event-alerts`; }
    };
})();

const API_BASE_URL = API_CONFIG.BASE_URL;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = API_CONFIG;
}
