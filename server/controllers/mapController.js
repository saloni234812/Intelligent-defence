const AIMonitoringService = require('../services/aiMonitoring');
const MapWebSocketService = require('../services/mapWebSocket');

class MapController {
  constructor() {
    this.aiMonitoring = new AIMonitoringService();
    this.mapWebSocket = null;
    this.setupEventHandlers();
  }

  /**
   * Set WebSocket service reference
   */
  setMapWebSocket(mapWebSocket) {
    this.mapWebSocket = mapWebSocket;
  }

  /**
   * Setup event handlers
   */
  setupEventHandlers() {
    // AI Monitoring events
    this.aiMonitoring.on('threatDetected', (threat) => {
      if (this.mapWebSocket) {
        this.mapWebSocket.sendThreatUpdate(threat);
      }
    });

    this.aiMonitoring.on('scanComplete', (data) => {
      if (this.mapWebSocket) {
        this.mapWebSocket.broadcastToRoom('tactical_maps', {
          type: 'ai_scan_complete',
          data,
          timestamp: new Date().toISOString()
        });
      }
    });
  }

  /**
   * Get map status
   */
  getMapStatus = async (req, res) => {
    try {
      const aiStatus = this.aiMonitoring.getStatus();
      const wsStatus = this.mapWebSocket ? this.mapWebSocket.getStats() : null;

      res.json({
        success: true,
        data: {
          ai: aiStatus,
          websocket: wsStatus,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error getting map status:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get map status'
      });
    }
  };

  /**
   * Start AI monitoring
   */
  startAIMonitoring = async (req, res) => {
    try {
      this.aiMonitoring.start();
      
      res.json({
        success: true,
        message: 'AI monitoring started',
        data: this.aiMonitoring.getStatus()
      });
    } catch (error) {
      console.error('Error starting AI monitoring:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to start AI monitoring'
      });
    }
  };

  /**
   * Stop AI monitoring
   */
  stopAIMonitoring = async (req, res) => {
    try {
      this.aiMonitoring.stop();
      
      res.json({
        success: true,
        message: 'AI monitoring stopped',
        data: this.aiMonitoring.getStatus()
      });
    } catch (error) {
      console.error('Error stopping AI monitoring:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to stop AI monitoring'
      });
    }
  };

  /**
   * Get all threats
   */
  getThreats = async (req, res) => {
    try {
      const { severity, limit = 50, offset = 0 } = req.query;
      
      let threats = this.aiMonitoring.getThreats();
      
      // Filter by severity if specified
      if (severity) {
        threats = threats.filter(threat => threat.severity === severity.toUpperCase());
      }
      
      // Apply pagination
      const total = threats.length;
      const paginatedThreats = threats.slice(offset, offset + parseInt(limit));
      
      res.json({
        success: true,
        data: paginatedThreats,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: offset + parseInt(limit) < total
        }
      });
    } catch (error) {
      console.error('Error getting threats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get threats'
      });
    }
  };

  /**
   * Get threats by severity
   */
  getThreatsBySeverity = async (req, res) => {
    try {
      const { severity } = req.params;
      
      if (!['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(severity.toUpperCase())) {
        return res.status(400).json({
          success: false,
          error: 'Invalid severity level'
        });
      }
      
      const threats = this.aiMonitoring.getThreatsBySeverity(severity.toUpperCase());
      
      res.json({
        success: true,
        data: threats,
        severity: severity.toUpperCase()
      });
    } catch (error) {
      console.error('Error getting threats by severity:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get threats by severity'
      });
    }
  };

  /**
   * Get recent threats
   */
  getRecentThreats = async (req, res) => {
    try {
      const { minutes = 10 } = req.query;
      const threats = this.aiMonitoring.getRecentThreats(parseInt(minutes));
      
      res.json({
        success: true,
        data: threats,
        timeframe: `${minutes} minutes`
      });
    } catch (error) {
      console.error('Error getting recent threats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get recent threats'
      });
    }
  };

  /**
   * Get radar stations
   */
  getRadarStations = async (req, res) => {
    try {
      // Mock radar stations data
      const radarStations = [
        {
          id: 1,
          name: 'RADAR-01',
          location: { lat: 40.7128, lng: -74.0060 },
          status: 'ONLINE',
          range: 5000,
          lastUpdate: new Date().toISOString()
        },
        {
          id: 2,
          name: 'RADAR-02',
          location: { lat: 40.7200, lng: -74.0100 },
          status: 'ONLINE',
          range: 5000,
          lastUpdate: new Date().toISOString()
        },
        {
          id: 3,
          name: 'RADAR-03',
          location: { lat: 40.7050, lng: -74.0150 },
          status: 'MAINTENANCE',
          range: 5000,
          lastUpdate: new Date(Date.now() - 300000).toISOString()
        }
      ];

      res.json({
        success: true,
        data: radarStations
      });
    } catch (error) {
      console.error('Error getting radar stations:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get radar stations'
      });
    }
  };

  /**
   * Get camera stations
   */
  getCameraStations = async (req, res) => {
    try {
      // Mock camera stations data
      const cameraStations = [
        {
          id: 1,
          name: 'CAM-ALPHA',
          location: { lat: 40.7150, lng: -74.0080 },
          status: 'ONLINE',
          type: 'PTZ',
          lastUpdate: new Date().toISOString()
        },
        {
          id: 2,
          name: 'CAM-BETA',
          location: { lat: 40.7080, lng: -74.0120 },
          status: 'ONLINE',
          type: 'FIXED',
          lastUpdate: new Date().toISOString()
        },
        {
          id: 3,
          name: 'CAM-GAMMA',
          location: { lat: 40.7200, lng: -74.0050 },
          status: 'OFFLINE',
          type: 'THERMAL',
          lastUpdate: new Date(Date.now() - 600000).toISOString()
        }
      ];

      res.json({
        success: true,
        data: cameraStations
      });
    } catch (error) {
      console.error('Error getting camera stations:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get camera stations'
      });
    }
  };

  /**
   * Get sensor stations
   */
  getSensorStations = async (req, res) => {
    try {
      // Mock sensor stations data
      const sensorStations = [
        {
          id: 1,
          name: 'SENSOR-01',
          location: { lat: 40.7100, lng: -74.0090 },
          type: 'MOTION',
          status: 'ACTIVE',
          lastUpdate: new Date().toISOString()
        },
        {
          id: 2,
          name: 'SENSOR-02',
          location: { lat: 40.7180, lng: -74.0070 },
          type: 'SOUND',
          status: 'ACTIVE',
          lastUpdate: new Date().toISOString()
        },
        {
          id: 3,
          name: 'SENSOR-03',
          location: { lat: 40.7050, lng: -74.0110 },
          type: 'VIBRATION',
          status: 'INACTIVE',
          lastUpdate: new Date(Date.now() - 900000).toISOString()
        }
      ];

      res.json({
        success: true,
        data: sensorStations
      });
    } catch (error) {
      console.error('Error getting sensor stations:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get sensor stations'
      });
    }
  };

  /**
   * Get security zones
   */
  getSecurityZones = async (req, res) => {
    try {
      // Mock security zones data
      const securityZones = [
        {
          id: 1,
          name: 'High Security Zone',
          type: 'RESTRICTED',
          coordinates: [
            [40.7100, -74.0150],
            [40.7200, -74.0150],
            [40.7200, -74.0050],
            [40.7100, -74.0050]
          ],
          description: 'Restricted access area with high security protocols',
          lastUpdate: new Date().toISOString()
        },
        {
          id: 2,
          name: 'Monitoring Zone',
          type: 'MONITORED',
          coordinates: [
            [40.7050, -74.0200],
            [40.7250, -74.0200],
            [40.7250, -74.0000],
            [40.7050, -74.0000]
          ],
          description: 'Area under continuous monitoring',
          lastUpdate: new Date().toISOString()
        }
      ];

      res.json({
        success: true,
        data: securityZones
      });
    } catch (error) {
      console.error('Error getting security zones:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get security zones'
      });
    }
  };

  /**
   * Get map statistics
   */
  getMapStatistics = async (req, res) => {
    try {
      const aiStatus = this.aiMonitoring.getStatus();
      const threats = this.aiMonitoring.getThreats();
      const recentThreats = this.aiMonitoring.getRecentThreats(60); // Last hour
      
      const statistics = {
        ai: {
          isActive: aiStatus.isActive,
          threatsDetected: aiStatus.threatsCount,
          patternsAnalyzed: aiStatus.patternsCount,
          anomaliesFound: aiStatus.anomaliesCount
        },
        threats: {
          total: threats.length,
          bySeverity: {
            CRITICAL: threats.filter(t => t.severity === 'CRITICAL').length,
            HIGH: threats.filter(t => t.severity === 'HIGH').length,
            MEDIUM: threats.filter(t => t.severity === 'MEDIUM').length,
            LOW: threats.filter(t => t.severity === 'LOW').length
          },
          recent: recentThreats.length,
          byType: {
            AIRCRAFT_THREAT: threats.filter(t => t.type === 'AIRCRAFT_THREAT').length,
            VEHICLE_THREAT: threats.filter(t => t.type === 'VEHICLE_THREAT').length,
            PERSON_THREAT: threats.filter(t => t.type === 'PERSON_THREAT').length,
            CYBER_THREAT: threats.filter(t => t.type === 'CYBER_THREAT').length
          }
        },
        system: {
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
          timestamp: new Date().toISOString()
        }
      };

      res.json({
        success: true,
        data: statistics
      });
    } catch (error) {
      console.error('Error getting map statistics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get map statistics'
      });
    }
  };

  /**
   * Clear all threats
   */
  clearThreats = async (req, res) => {
    try {
      // Clear threats from AI monitoring
      this.aiMonitoring.threats.clear();
      this.aiMonitoring.anomalies = [];
      
      // Notify map clients
      if (this.mapWebSocket) {
        this.mapWebSocket.broadcastToRoom('tactical_maps', {
          type: 'threats_cleared',
          timestamp: new Date().toISOString()
        });
      }
      
      res.json({
        success: true,
        message: 'All threats cleared'
      });
    } catch (error) {
      console.error('Error clearing threats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to clear threats'
      });
    }
  };
}

module.exports = new MapController();

