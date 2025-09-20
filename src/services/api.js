// Centralized API service for the Intelligent Defense System
// Use relative base so Vite proxy handles requests in development.
const API_BASE = '';

class ApiService {
  constructor() {
    this.baseURL = API_BASE;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Handle different response types
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      return await response.text();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Alert APIs
  async getAlerts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/alerts${queryString ? `?${queryString}` : ''}`);
  }

  async createAlert(alertData) {
    return this.request('/api/alerts', {
      method: 'POST',
      body: JSON.stringify(alertData),
    });
  }

  async acknowledgeAlert(alertId, data = {}) {
    return this.request(`/api/alerts/${alertId}/ack`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Radar APIs
  async getRadarDetections(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/radar${queryString ? `?${queryString}` : ''}`);
  }

  async createRadarDetection(detectionData) {
    return this.request('/api/radar', {
      method: 'POST',
      body: JSON.stringify(detectionData),
    });
  }

  async clearRadarDetections() {
    return this.request('/api/radar', {
      method: 'DELETE',
    });
  }

  // System APIs
  async getSystemStatus() {
    return this.request('/api/system/status');
  }

  async getSystemMetrics(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/system/metrics${queryString ? `?${queryString}` : ''}`);
  }

  async getSystemHealth() {
    return this.request('/api/system/health');
  }

  // User APIs
  async getUsers() {
    return this.request('/api/users');
  }

  async createUser(userData) {
    return this.request('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(userId, userData) {
    return this.request(`/api/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(userId) {
    return this.request(`/api/users/${userId}`, {
      method: 'DELETE',
    });
  }

  // Playbook APIs
  async getPlaybooks() {
    return this.request('/api/playbooks');
  }

  async createPlaybook(playbookData) {
    return this.request('/api/playbooks', {
      method: 'POST',
      body: JSON.stringify(playbookData),
    });
  }

  async executePlaybook(playbookId) {
    return this.request(`/api/playbooks/${playbookId}/execute`, {
      method: 'POST',
    });
  }

  async updatePlaybook(playbookId, playbookData) {
    return this.request(`/api/playbooks/${playbookId}`, {
      method: 'PUT',
      body: JSON.stringify(playbookData),
    });
  }

  async deletePlaybook(playbookId) {
    return this.request(`/api/playbooks/${playbookId}`, {
      method: 'DELETE',
    });
  }

  // Sensor APIs
  async getSensors() {
    return this.request('/api/sensors');
  }

  async getSensorStatus(sensorId) {
    return this.request(`/api/sensors/${sensorId}/status`);
  }

  // Map APIs
  async getMapData(area) {
    return this.request(`/api/maps/${area}`);
  }

  // AI Command APIs
  async sendAICommand(command) {
    return this.request('/api/ai/command', {
      method: 'POST',
      body: JSON.stringify({ command }),
    });
  }

  // Voice APIs
  async speakText(text) {
    return this.request('/api/voice/speak', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  }

  // Threat Types APIs
  async getThreatTypes() {
    return this.request('/api/threats');
  }

  async getThreatCategories() {
    return this.request('/api/threats/categories/list');
  }

  async getThreatTypesByCategory(category) {
    return this.request(`/api/threats/category/${category}`);
  }

  async getThreatTypesBySeverity(severity) {
    return this.request(`/api/threats/severity/${severity}`);
  }

  async getThreatTypeById(id) {
    return this.request(`/api/threats/${id}`);
  }

  // WebSocket connections
  createRadarWebSocket() {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
    const wsOrigin = origin.replace(/^http/, 'ws');
    return new WebSocket(wsOrigin + '/api/radar/stream');
  }

  createAlertsWebSocket() {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
    const wsOrigin = origin.replace(/^http/, 'ws');
    return new WebSocket(wsOrigin + '/ws/alerts');
  }

  // Utility methods
  async getAlertStats() {
    try {
      const [summary, trends] = await Promise.all([
        this.getSystemStatus(),
        this.getSystemMetrics({ days: 7 })
      ]);
      
      return {
        summary: {
          active_alerts: summary.active_alerts || 0,
          critical_alerts: summary.critical_alerts || 0,
          system_health: summary.system_health || 0,
          uptime: summary.uptime || 0
        },
        trends: trends.system_health || []
      };
    } catch (error) {
      console.error('Failed to get alert stats:', error);
      return {
        summary: { active_alerts: 0, critical_alerts: 0, system_health: 0, uptime: 0 },
        trends: []
      };
    }
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;
