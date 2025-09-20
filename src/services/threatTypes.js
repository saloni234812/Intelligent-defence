// Frontend Threat Types Service
import apiService from './api';

// Threat type icons mapping
export const THREAT_ICONS = {
  'PHYSICAL_INTRUSION': 'Shield',
  'VEHICLE_THREAT': 'Truck',
  'PEDESTRIAN_THREAT': 'User',
  'UAV_THREAT': 'Zap',
  'AIRCRAFT_THREAT': 'Plane',
  'CYBER_INTRUSION': 'Shield',
  'DDOS_ATTACK': 'Wifi',
  'DATA_EXFILTRATION': 'Database',
  'FIRE_THREAT': 'Flame',
  'HAZMAT_THREAT': 'AlertTriangle',
  'NATURAL_DISASTER': 'CloudRain',
  'RF_INTERFERENCE': 'Radio',
  'COMMUNICATION_BREACH': 'Phone',
  'SYSTEM_FAILURE': 'AlertCircle',
  'MAINTENANCE_REQUIRED': 'Wrench',
  'RECONNAISSANCE': 'Eye',
  'ESPIONAGE': 'UserCheck'
};

// Threat category colors
export const THREAT_COLORS = {
  'PHYSICAL': '#ef4444',
  'AERIAL': '#dc2626',
  'CYBER': '#7c3aed',
  'ENVIRONMENTAL': '#f59e0b',
  'COMMUNICATION': '#f59e0b',
  'EQUIPMENT': '#6b7280',
  'INTELLIGENCE': '#dc2626'
};

// Severity colors
export const SEVERITY_COLORS = {
  'CRITICAL': '#dc2626',
  'HIGH': '#f59e0b',
  'MEDIUM': '#eab308',
  'LOW': '#6b7280'
};

// Source colors
export const SOURCE_COLORS = {
  'SYSTEM': '#6b7280',
  'SENSOR': '#3b82f6',
  'MANUAL': '#10b981',
  'AI': '#8b5cf6',
  'RADAR': '#f59e0b'
};

class ThreatTypesService {
  constructor() {
    this.threatTypes = null;
    this.categories = null;
    this.roles = null;
  }

  // Get all threat types from backend
  async getThreatTypes() {
    if (this.threatTypes) return this.threatTypes;
    
    try {
      const response = await apiService.request('/api/threats');
      this.threatTypes = response.data || response;
      return this.threatTypes;
    } catch (error) {
      console.error('Failed to fetch threat types:', error);
      return [];
    }
  }

  // Get threat categories
  async getCategories() {
    if (this.categories) return this.categories;
    
    try {
      const response = await apiService.request('/api/threats/categories/list');
      this.categories = response.data || response;
      return this.categories;
    } catch (error) {
      console.error('Failed to fetch threat categories:', error);
      return [];
    }
  }

  // Get threat types by category
  async getThreatTypesByCategory(category) {
    try {
      const response = await apiService.request(`/api/threats/category/${category}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch threat types for category ${category}:`, error);
      return [];
    }
  }

  // Get threat types by severity
  async getThreatTypesBySeverity(severity) {
    try {
      const response = await apiService.request(`/api/threats/severity/${severity}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch threat types for severity ${severity}:`, error);
      return [];
    }
  }

  // Get specific threat type by ID
  async getThreatTypeById(id) {
    try {
      const response = await apiService.request(`/api/threats/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch threat type ${id}:`, error);
      return null;
    }
  }

  // Get threat roles (responsibilities, recommended actions)
  async getThreatRoles() {
    if (this.roles) return this.roles;
    try {
      const response = await apiService.request('/api/threats/roles');
      this.roles = response.data;
      return this.roles;
    } catch (error) {
      console.error('Failed to fetch threat roles:', error);
      return [];
    }
  }

  // Get a single threat role by threat type ID
  async getThreatRoleById(id) {
    try {
      const response = await apiService.request(`/api/threats/roles/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch threat role for ${id}:`, error);
      return null;
    }
  }

  // Get all threat types merged with role info
  async getThreatTypesWithRoles() {
    try {
      const response = await apiService.request('/api/threats/with/roles');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch threat types with roles:', error);
      return [];
    }
  }

  // Get threat type icon
  getThreatIcon(threatType) {
    return THREAT_ICONS[threatType] || 'AlertTriangle';
  }

  // Get threat category color
  getCategoryColor(category) {
    return THREAT_COLORS[category] || '#6b7280';
  }

  // Get severity color
  getSeverityColor(severity) {
    return SEVERITY_COLORS[severity] || '#6b7280';
  }

  // Get source color
  getSourceColor(source) {
    return SOURCE_COLORS[source] || '#6b7280';
  }

  // Format threat type for display
  formatThreatType(threatType) {
    if (!threatType) return 'Unknown';
    return threatType.replace(/_/g, ' ').toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // Format threat category for display
  formatCategory(category) {
    if (!category) return 'Unknown';
    return category.charAt(0) + category.slice(1).toLowerCase().replace('_', ' ');
  }

  // Get priority level from priority number
  getPriorityLevel(priority) {
    if (priority <= 2) return 'Critical';
    if (priority <= 4) return 'High';
    if (priority <= 6) return 'Medium';
    return 'Low';
  }

  // Get priority color
  getPriorityColor(priority) {
    const level = this.getPriorityLevel(priority);
    return this.getSeverityColor(level.toUpperCase());
  }

  // Filter alerts by threat type
  filterAlertsByThreatType(alerts, threatType) {
    return alerts.filter(alert => alert.threat_type === threatType);
  }

  // Filter alerts by threat category
  filterAlertsByCategory(alerts, category) {
    return alerts.filter(alert => alert.threat_category === category);
  }

  // Filter alerts by severity
  filterAlertsBySeverity(alerts, severity) {
    return alerts.filter(alert => alert.alert_type === severity);
  }

  // Group alerts by threat category
  groupAlertsByCategory(alerts) {
    const grouped = {};
    alerts.forEach(alert => {
      const category = alert.threat_category || 'UNKNOWN';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(alert);
    });
    return grouped;
  }

  // Get threat statistics
  getThreatStatistics(alerts) {
    const stats = {
      total: alerts.length,
      byCategory: {},
      bySeverity: {},
      bySource: {},
      byStatus: {}
    };

    alerts.forEach(alert => {
      // By category
      const category = alert.threat_category || 'UNKNOWN';
      stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;

      // By severity
      const severity = alert.alert_type || 'UNKNOWN';
      stats.bySeverity[severity] = (stats.bySeverity[severity] || 0) + 1;

      // By source
      const source = alert.source || 'UNKNOWN';
      stats.bySource[source] = (stats.bySource[source] || 0) + 1;

      // By status
      const status = alert.status || 'UNKNOWN';
      stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;
    });

    return stats;
  }
}

// Create and export singleton instance
const threatTypesService = new ThreatTypesService();
export default threatTypesService;
