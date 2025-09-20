const request = require('supertest');
const app = require('../../index');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');

describe('Authentication', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/users/signup', () => {
    it('should create a new user with valid data', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'User'
      };

      const response = await request(app)
        .post('/api/users/signup')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.password).toBeUndefined();
    });

    it('should not create user with invalid email', async () => {
      const userData = {
        name: 'Test User',
        email: 'invalid-email',
        password: 'password123'
      };

      await request(app)
        .post('/api/users/signup')
        .send(userData)
        .expect(400);
    });

    it('should not create user with weak password', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: '123'
      };

      await request(app)
        .post('/api/users/signup')
        .send(userData)
        .expect(400);
    });
  });

  describe('POST /api/users/login', () => {
    beforeEach(async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password_hash: hashedPassword,
        role: 'User'
      });
    });

    it('should login with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/users/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
    });

    it('should not login with invalid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      await request(app)
        .post('/api/users/login')
        .send(loginData)
        .expect(401);
    });
  });

  describe('GET /api/users/me', () => {
    let token;
    let user;

    beforeEach(async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password_hash: hashedPassword,
        role: 'User'
      });

      const loginResponse = await request(app)
        .post('/api/users/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      token = loginResponse.body.token;
    });

    it('should return user data with valid token', async () => {
      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.user.email).toBe(user.email);
    });

    it('should not return user data without token', async () => {
      await request(app)
        .get('/api/users/me')
        .expect(401);
    });
  });
});


