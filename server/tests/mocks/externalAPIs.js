// Mock external APIs for testing
const nock = require('nock');

const mockExternalAPIs = {
  // Mock radar system API
  mockRadarAPI: () => {
    return nock('http://radar-system.example.com')
      .get('/detections')
      .reply(200, {
        detections: [
          {
            id: 'radar_001',
            type: 'AIRCRAFT',
            location: 'Sector Alpha-7',
            distance: 15.5,
            speed: 250,
            bearing: 45,
            timestamp: new Date().toISOString()
          }
        ]
      });
  },

  // Mock threat intelligence API
  mockThreatIntelligenceAPI: () => {
    return nock('http://threat-intel.example.com')
      .get('/threats')
      .reply(200, {
        threats: [
          {
            id: 'threat_001',
            type: 'MALWARE',
            severity: 'HIGH',
            description: 'Suspicious network activity detected',
            indicators: ['192.168.1.100', 'malicious-domain.com']
          }
        ]
      });
  },

  // Mock notification service
  mockNotificationService: () => {
    return nock('http://notification-service.example.com')
      .post('/send')
      .reply(200, {
        success: true,
        messageId: 'msg_123456'
      });
  },

  // Mock weather API for environmental factors
  mockWeatherAPI: () => {
    return nock('http://weather-api.example.com')
      .get('/current')
      .reply(200, {
        temperature: 22,
        humidity: 65,
        windSpeed: 15,
        visibility: 10
      });
  },

  // Mock geolocation API
  mockGeolocationAPI: () => {
    return nock('http://geo-api.example.com')
      .get('/reverse')
      .query({ lat: 40.7128, lon: -74.0060 })
      .reply(200, {
        address: 'New York, NY, USA',
        country: 'United States',
        timezone: 'America/New_York'
      });
  }
};

module.exports = mockExternalAPIs;


