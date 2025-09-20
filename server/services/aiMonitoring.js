const { EventEmitter } = require('events');
const { DateTimeUtils } = require('../utils/dateTime');
const NotificationUtils = require('../utils/notifications');

class AIMonitoringService extends EventEmitter {
  constructor() {
    super();
    this.isActive = false;
    this.threats = new Map();
    this.patterns = new Map();
    this.anomalies = [];
    this.monitoringInterval = null;
    this.notificationUtils = new NotificationUtils();
    
    // AI Configuration
    this.config = {
      scanInterval: 5000, // 5 seconds
      threatThreshold: 0.7,
      anomalyThreshold: 0.8,
      maxThreats: 1000,
      patternWindow: 300000, // 5 minutes
      confidenceDecay: 0.95
    };

    // Threat patterns for AI detection
    this.threatPatterns = {
      'AIRCRAFT_THREAT': {
        keywords: ['aircraft', 'plane', 'helicopter', 'drone', 'uav'],
        severity: 'HIGH',
        confidence: 0.85
      },
      'VEHICLE_THREAT': {
        keywords: ['vehicle', 'car', 'truck', 'suspicious', 'unauthorized'],
        severity: 'MEDIUM',
        confidence: 0.75
      },
      'PERSON_THREAT': {
        keywords: ['person', 'intruder', 'unauthorized', 'breach'],
        severity: 'HIGH',
        confidence: 0.80
      },
      'CYBER_THREAT': {
        keywords: ['hack', 'breach', 'malware', 'intrusion', 'attack'],
        severity: 'CRITICAL',
        confidence: 0.90
      }
    };
  }

  /**
   * Start AI monitoring
   */
  start() {
    if (this.isActive) {
      console.log('AI monitoring already active');
      return;
    }

    this.isActive = true;
    console.log('🤖 AI Monitoring started');

    // Start monitoring interval
    this.monitoringInterval = setInterval(() => {
      this.performAIScan();
    }, this.config.scanInterval);

    // Start pattern analysis
    this.startPatternAnalysis();

    this.emit('aiStarted');
  }

  /**
   * Stop AI monitoring
   */
  stop() {
    if (!this.isActive) {
      console.log('AI monitoring not active');
      return;
    }

    this.isActive = false;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    console.log('🤖 AI Monitoring stopped');
    this.emit('aiStopped');
  }

  /**
   * Perform AI scan for threats
   */
  async performAIScan() {
    try {
      // Simulate AI analysis of sensor data
      const sensorData = await this.collectSensorData();
      const threats = await this.analyzeThreats(sensorData);
      
      // Process detected threats
      for (const threat of threats) {
        await this.processThreat(threat);
      }

      // Update threat confidence based on time
      this.updateThreatConfidence();

      // Emit monitoring status
      this.emit('scanComplete', {
        timestamp: new Date(),
        threatsDetected: threats.length,
        totalThreats: this.threats.size,
        anomalies: this.anomalies.length
      });

    } catch (error) {
      console.error('AI scan error:', error);
      this.emit('scanError', error);
    }
  }

  /**
   * Collect sensor data for analysis
   */
  async collectSensorData() {
    // Simulate collecting data from various sensors
    const sensorData = {
      radar: this.simulateRadarData(),
      cameras: this.simulateCameraData(),
      motion: this.simulateMotionData(),
      acoustic: this.simulateAcousticData(),
      network: this.simulateNetworkData()
    };

    return sensorData;
  }

  /**
   * Analyze threats using AI algorithms
   */
  async analyzeThreats(sensorData) {
    const threats = [];

    // Analyze radar data
    if (sensorData.radar.length > 0) {
      const radarThreats = this.analyzeRadarThreats(sensorData.radar);
      threats.push(...radarThreats);
    }

    // Analyze camera data
    if (sensorData.cameras.length > 0) {
      const cameraThreats = this.analyzeCameraThreats(sensorData.cameras);
      threats.push(...cameraThreats);
    }

    // Analyze motion data
    if (sensorData.motion.length > 0) {
      const motionThreats = this.analyzeMotionThreats(sensorData.motion);
      threats.push(...motionThreats);
    }

    // Analyze network data
    if (sensorData.network.length > 0) {
      const networkThreats = this.analyzeNetworkThreats(sensorData.network);
      threats.push(...networkThreats);
    }

    return threats;
  }

  /**
   * Analyze radar data for threats
   */
  analyzeRadarThreats(radarData) {
    const threats = [];

    for (const detection of radarData) {
      // AI analysis of radar signature
      const threatProbability = this.calculateThreatProbability(detection, 'radar');
      
      if (threatProbability > this.config.threatThreshold) {
        threats.push({
          id: `radar_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'AIRCRAFT_THREAT',
          severity: this.determineSeverity(threatProbability),
          confidence: Math.round(threatProbability * 100),
          location: {
            lat: detection.lat,
            lng: detection.lng
          },
          source: 'RADAR',
          description: `AI detected ${detection.type} with ${Math.round(threatProbability * 100)}% confidence`,
          timestamp: new Date(),
          metadata: {
            speed: detection.speed,
            altitude: detection.altitude,
            bearing: detection.bearing,
            range: detection.range
          }
        });
      }
    }

    return threats;
  }

  /**
   * Analyze camera data for threats
   */
  analyzeCameraThreats(cameraData) {
    const threats = [];

    for (const frame of cameraData) {
      // AI analysis of camera feed
      const threatProbability = this.calculateThreatProbability(frame, 'camera');
      
      if (threatProbability > this.config.threatThreshold) {
        threats.push({
          id: `camera_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: this.classifyThreatType(frame),
          severity: this.determineSeverity(threatProbability),
          confidence: Math.round(threatProbability * 100),
          location: {
            lat: frame.lat,
            lng: frame.lng
          },
          source: 'CAMERA',
          description: `AI detected ${frame.object} with ${Math.round(threatProbability * 100)}% confidence`,
          timestamp: new Date(),
          metadata: {
            cameraId: frame.cameraId,
            objectType: frame.object,
            boundingBox: frame.boundingBox
          }
        });
      }
    }

    return threats;
  }

  /**
   * Analyze motion sensor data
   */
  analyzeMotionThreats(motionData) {
    const threats = [];

    for (const motion of motionData) {
      const threatProbability = this.calculateThreatProbability(motion, 'motion');
      
      if (threatProbability > this.config.threatThreshold) {
        threats.push({
          id: `motion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'PERSON_THREAT',
          severity: this.determineSeverity(threatProbability),
          confidence: Math.round(threatProbability * 100),
          location: {
            lat: motion.lat,
            lng: motion.lng
          },
          source: 'MOTION_SENSOR',
          description: `AI detected suspicious movement with ${Math.round(threatProbability * 100)}% confidence`,
          timestamp: new Date(),
          metadata: {
            sensorId: motion.sensorId,
            intensity: motion.intensity,
            duration: motion.duration
          }
        });
      }
    }

    return threats;
  }

  /**
   * Analyze network data for cyber threats
   */
  analyzeNetworkThreats(networkData) {
    const threats = [];

    for (const event of networkData) {
      const threatProbability = this.calculateThreatProbability(event, 'network');
      
      if (threatProbability > this.config.threatThreshold) {
        threats.push({
          id: `network_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'CYBER_THREAT',
          severity: this.determineSeverity(threatProbability),
          confidence: Math.round(threatProbability * 100),
          location: {
            lat: event.lat || 0,
            lng: event.lng || 0
          },
          source: 'NETWORK',
          description: `AI detected ${event.type} with ${Math.round(threatProbability * 100)}% confidence`,
          timestamp: new Date(),
          metadata: {
            sourceIP: event.sourceIP,
            targetIP: event.targetIP,
            protocol: event.protocol,
            port: event.port
          }
        });
      }
    }

    return threats;
  }

  /**
   * Calculate threat probability using AI algorithms
   */
  calculateThreatProbability(data, source) {
    let probability = 0;

    // Base probability based on source type
    const sourceWeights = {
      radar: 0.3,
      camera: 0.4,
      motion: 0.2,
      network: 0.5
    };

    probability += sourceWeights[source] || 0.1;

    // Add randomness to simulate AI uncertainty
    probability += (Math.random() - 0.5) * 0.3;

    // Ensure probability is between 0 and 1
    return Math.max(0, Math.min(1, probability));
  }

  /**
   * Determine threat severity based on probability
   */
  determineSeverity(probability) {
    if (probability >= 0.9) return 'CRITICAL';
    if (probability >= 0.7) return 'HIGH';
    if (probability >= 0.5) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Classify threat type based on data
   */
  classifyThreatType(data) {
    const objectType = data.object?.toLowerCase() || '';
    
    if (objectType.includes('aircraft') || objectType.includes('drone')) {
      return 'AIRCRAFT_THREAT';
    } else if (objectType.includes('vehicle') || objectType.includes('car')) {
      return 'VEHICLE_THREAT';
    } else if (objectType.includes('person') || objectType.includes('human')) {
      return 'PERSON_THREAT';
    } else {
      return 'UNKNOWN_THREAT';
    }
  }

  /**
   * Process detected threat
   */
  async processThreat(threat) {
    // Store threat
    this.threats.set(threat.id, threat);

    // Emit threat event
    this.emit('threatDetected', threat);

    // Send notifications for high-severity threats
    if (threat.severity === 'CRITICAL' || threat.severity === 'HIGH') {
      await this.sendThreatNotification(threat);
    }

    // Update patterns
    this.updateThreatPatterns(threat);

    // Clean up old threats
    this.cleanupOldThreats();
  }

  /**
   * Send threat notification
   */
  async sendThreatNotification(threat) {
    try {
      const alert = {
        alert_type: threat.severity,
        title: `AI Detected ${threat.type}`,
        description: threat.description,
        location: `${threat.location.lat.toFixed(4)}, ${threat.location.lng.toFixed(4)}`,
        confidence: threat.confidence,
        status: 'ACTIVE',
        threat_type: threat.type,
        threat_category: this.getThreatCategory(threat.type),
        source: threat.source,
        created_at: threat.timestamp.toISOString()
      };

      await this.notificationUtils.sendAlertNotification(alert, [
        { type: 'email', address: 'admin@aegis.com' }
      ]);

    } catch (error) {
      console.error('Failed to send threat notification:', error);
    }
  }

  /**
   * Get threat category
   */
  getThreatCategory(threatType) {
    const categories = {
      'AIRCRAFT_THREAT': 'AERIAL',
      'VEHICLE_THREAT': 'PHYSICAL',
      'PERSON_THREAT': 'PHYSICAL',
      'CYBER_THREAT': 'CYBER',
      'UNKNOWN_THREAT': 'UNKNOWN'
    };
    return categories[threatType] || 'UNKNOWN';
  }

  /**
   * Update threat patterns for learning
   */
  updateThreatPatterns(threat) {
    const patternKey = `${threat.type}_${threat.source}`;
    const now = Date.now();
    
    if (!this.patterns.has(patternKey)) {
      this.patterns.set(patternKey, {
        count: 0,
        lastSeen: now,
        locations: [],
        severities: []
      });
    }

    const pattern = this.patterns.get(patternKey);
    pattern.count++;
    pattern.lastSeen = now;
    pattern.locations.push(threat.location);
    pattern.severities.push(threat.severity);

    // Keep only recent data
    if (pattern.locations.length > 100) {
      pattern.locations = pattern.locations.slice(-50);
    }
  }

  /**
   * Start pattern analysis
   */
  startPatternAnalysis() {
    setInterval(() => {
      this.analyzePatterns();
    }, 60000); // Analyze patterns every minute
  }

  /**
   * Analyze threat patterns
   */
  analyzePatterns() {
    const now = Date.now();
    const anomalies = [];

    for (const [patternKey, pattern] of this.patterns) {
      // Check for unusual frequency
      if (pattern.count > 10 && (now - pattern.lastSeen) < this.config.patternWindow) {
        anomalies.push({
          type: 'HIGH_FREQUENCY',
          pattern: patternKey,
          count: pattern.count,
          severity: 'MEDIUM'
        });
      }

      // Check for clustering
      if (pattern.locations.length > 5) {
        const clustering = this.calculateClustering(pattern.locations);
        if (clustering > 0.8) {
          anomalies.push({
            type: 'CLUSTERING',
            pattern: patternKey,
            clustering: clustering,
            severity: 'HIGH'
          });
        }
      }
    }

    this.anomalies = anomalies;
    this.emit('patternAnalysis', { anomalies, patterns: this.patterns.size });
  }

  /**
   * Calculate clustering coefficient
   */
  calculateClustering(locations) {
    if (locations.length < 3) return 0;

    // Simple clustering calculation based on distance
    let totalDistance = 0;
    let count = 0;

    for (let i = 0; i < locations.length; i++) {
      for (let j = i + 1; j < locations.length; j++) {
        const distance = this.calculateDistance(locations[i], locations[j]);
        totalDistance += distance;
        count++;
      }
    }

    const avgDistance = totalDistance / count;
    return Math.max(0, 1 - (avgDistance / 1000)); // Normalize by 1km
  }

  /**
   * Calculate distance between two points
   */
  calculateDistance(point1, point2) {
    const R = 6371; // Earth's radius in km
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLng = (point2.lng - point1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  /**
   * Update threat confidence over time
   */
  updateThreatConfidence() {
    const now = Date.now();
    const decayThreshold = 300000; // 5 minutes

    for (const [threatId, threat] of this.threats) {
      const age = now - threat.timestamp.getTime();
      if (age > decayThreshold) {
        threat.confidence *= this.config.confidenceDecay;
        
        if (threat.confidence < 30) {
          this.threats.delete(threatId);
        }
      }
    }
  }

  /**
   * Clean up old threats
   */
  cleanupOldThreats() {
    if (this.threats.size > this.config.maxThreats) {
      const sortedThreats = Array.from(this.threats.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const toRemove = sortedThreats.slice(0, this.threats.size - this.config.maxThreats);
      toRemove.forEach(([id]) => this.threats.delete(id));
    }
  }

  /**
   * Simulate radar data
   */
  simulateRadarData() {
    const data = [];
    if (Math.random() < 0.3) { // 30% chance of detection
      data.push({
        lat: 40.7128 + (Math.random() - 0.5) * 0.01,
        lng: -74.0060 + (Math.random() - 0.5) * 0.01,
        type: ['AIRCRAFT', 'UAV', 'HELICOPTER'][Math.floor(Math.random() * 3)],
        speed: Math.random() * 500 + 100,
        altitude: Math.random() * 1000 + 100,
        bearing: Math.random() * 360,
        range: Math.random() * 10000 + 1000
      });
    }
    return data;
  }

  /**
   * Simulate camera data
   */
  simulateCameraData() {
    const data = [];
    if (Math.random() < 0.2) { // 20% chance of detection
      data.push({
        lat: 40.7128 + (Math.random() - 0.5) * 0.01,
        lng: -74.0060 + (Math.random() - 0.5) * 0.01,
        cameraId: `CAM_${Math.floor(Math.random() * 10)}`,
        object: ['person', 'vehicle', 'aircraft', 'suspicious_object'][Math.floor(Math.random() * 4)],
        boundingBox: {
          x: Math.random() * 100,
          y: Math.random() * 100,
          width: Math.random() * 50 + 10,
          height: Math.random() * 50 + 10
        }
      });
    }
    return data;
  }

  /**
   * Simulate motion sensor data
   */
  simulateMotionData() {
    const data = [];
    if (Math.random() < 0.15) { // 15% chance of detection
      data.push({
        lat: 40.7128 + (Math.random() - 0.5) * 0.01,
        lng: -74.0060 + (Math.random() - 0.5) * 0.01,
        sensorId: `MOTION_${Math.floor(Math.random() * 20)}`,
        intensity: Math.random() * 100,
        duration: Math.random() * 5000 + 1000
      });
    }
    return data;
  }

  /**
   * Simulate acoustic sensor data
   */
  simulateAcousticData() {
    const data = [];
    if (Math.random() < 0.1) { // 10% chance of detection
      data.push({
        lat: 40.7128 + (Math.random() - 0.5) * 0.01,
        lng: -74.0060 + (Math.random() - 0.5) * 0.01,
        sensorId: `ACOUSTIC_${Math.floor(Math.random() * 15)}`,
        frequency: Math.random() * 20000 + 20,
        amplitude: Math.random() * 100,
        duration: Math.random() * 3000 + 500
      });
    }
    return data;
  }

  /**
   * Simulate network data
   */
  simulateNetworkData() {
    const data = [];
    if (Math.random() < 0.25) { // 25% chance of detection
      data.push({
        lat: 40.7128 + (Math.random() - 0.5) * 0.01,
        lng: -74.0060 + (Math.random() - 0.5) * 0.01,
        type: ['intrusion', 'malware', 'ddos', 'unauthorized_access'][Math.floor(Math.random() * 4)],
        sourceIP: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        targetIP: `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        protocol: ['TCP', 'UDP', 'ICMP'][Math.floor(Math.random() * 3)],
        port: Math.floor(Math.random() * 65535) + 1
      });
    }
    return data;
  }

  /**
   * Get current status
   */
  getStatus() {
    return {
      isActive: this.isActive,
      threatsCount: this.threats.size,
      patternsCount: this.patterns.size,
      anomaliesCount: this.anomalies.length,
      config: this.config
    };
  }

  /**
   * Get all threats
   */
  getThreats() {
    return Array.from(this.threats.values());
  }

  /**
   * Get threats by severity
   */
  getThreatsBySeverity(severity) {
    return Array.from(this.threats.values()).filter(threat => threat.severity === severity);
  }

  /**
   * Get recent threats
   */
  getRecentThreats(minutes = 10) {
    const cutoff = new Date(Date.now() - minutes * 60000);
    return Array.from(this.threats.values()).filter(threat => threat.timestamp > cutoff);
  }
}

module.exports = AIMonitoringService;

