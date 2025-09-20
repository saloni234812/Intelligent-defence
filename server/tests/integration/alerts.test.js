const request = require('supertest');
const app = require('../../index');
const Alert = require('../../models/Alert');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');

describe('Alerts API Integration', () => {
  let token;
  let user;

  beforeEach(async () => {
    await Alert.deleteMany({});
    await User.deleteMany({});

    // Create test user
    const hashedPassword = await bcrypt.hash('password123', 10);
    user = await User.create({
      name: 'Test Operator',
      email: 'operator@test.com',
      password_hash: hashedPassword,
      role: 'Operator'
    });

    // Login to get token
    const loginResponse = await request(app)
      .post('/api/users/login')
      .send({
        email: 'operator@test.com',
        password: 'password123'
      });

    token = loginResponse.body.token;
  });

  describe('GET /api/alerts', () => {
    it('should return all alerts for authenticated user', async () => {
      // Create test alerts
      await Alert.create([
        {
          alert_type: 'CRITICAL',
          title: 'Test Alert 1',
          description: 'Test description 1',
          location: 'Test Location 1',
          confidence: 95,
          status: 'ACTIVE',
          threat_type: 'AIRCRAFT_THREAT',
          threat_category: 'AERIAL',
          source: 'RADAR'
        },
        {
          alert_type: 'HIGH',
          title: 'Test Alert 2',
          description: 'Test description 2',
          location: 'Test Location 2',
          confidence: 88,
          status: 'INVESTIGATING',
          threat_type: 'PHYSICAL_INTRUSION',
          threat_category: 'PHYSICAL',
          source: 'SENSOR'
        }
      ]);

      const response = await request(app)
        .get('/api/alerts')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0]).toHaveProperty('title');
      expect(response.body.data[0]).toHaveProperty('alert_type');
    });

    it('should return empty array when no alerts exist', async () => {
      const response = await request(app)
        .get('/api/alerts')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data).toHaveLength(0);
    });
  });

  describe('POST /api/alerts', () => {
    it('should create a new alert with valid data', async () => {
      const alertData = {
        alert_type: 'CRITICAL',
        title: 'New Test Alert',
        description: 'New test description',
        location: 'New Test Location',
        confidence: 95,
        threat_type: 'AIRCRAFT_THREAT',
        threat_category: 'AERIAL',
        source: 'RADAR'
      };

      const response = await request(app)
        .post('/api/alerts')
        .set('Authorization', `Bearer ${token}`)
        .send(alertData)
        .expect(201);

      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.title).toBe(alertData.title);
      expect(response.body.data.status).toBe('ACTIVE');
    });

    it('should not create alert with invalid data', async () => {
      const invalidAlertData = {
        alert_type: 'INVALID_TYPE',
        title: '', // Empty title
        description: 'Test description',
        location: 'Test Location',
        confidence: 150 // Invalid confidence
      };

      await request(app)
        .post('/api/alerts')
        .set('Authorization', `Bearer ${token}`)
        .send(invalidAlertData)
        .expect(400);
    });
  });

  describe('POST /api/alerts/:id/ack', () => {
    it('should acknowledge an alert', async () => {
      const alert = await Alert.create({
        alert_type: 'CRITICAL',
        title: 'Test Alert',
        description: 'Test description',
        location: 'Test Location',
        confidence: 95,
        status: 'ACTIVE',
        threat_type: 'AIRCRAFT_THREAT',
        threat_category: 'AERIAL',
        source: 'RADAR'
      });

      const response = await request(app)
        .post(`/api/alerts/${alert.id}/ack`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data.status).toBe('ACKNOWLEDGED');
    });

    it('should return 404 for non-existent alert', async () => {
      await request(app)
        .post('/api/alerts/nonexistent/ack')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });
});


