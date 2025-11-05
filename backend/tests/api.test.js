/**
 * Backend API Unit Tests
 * Testing REST endpoints for KuponGo
 */

const request = require('supertest');
const { expect } = require('chai');

// Mock server setup (будет создан позже)
const BASE_URL = process.env.API_URL || 'http://localhost:3000';

describe('KuponGo Backend API Tests', () => {

  describe('Health Check', () => {
    it('GET /health should return 200 OK', async () => {
      const res = await request(BASE_URL)
        .get('/health')
        .expect(200);

      expect(res.body).to.have.property('status', 'ok');
      expect(res.body).to.have.property('timestamp');
    });
  });

  describe('User Management', () => {
    let authToken;
    const testUser = {
      username: 'test_user_' + Date.now(),
      email: `test${Date.now()}@example.com`,
      password: 'SecurePassword123!'
    };

    it('POST /api/users/register should create new user', async () => {
      const res = await request(BASE_URL)
        .post('/api/users/register')
        .send(testUser)
        .expect(201);

      expect(res.body).to.have.property('userId');
      expect(res.body).to.have.property('username', testUser.username);
      expect(res.body).to.not.have.property('password');
    });

    it('POST /api/users/login should authenticate user', async () => {
      const res = await request(BASE_URL)
        .post('/api/users/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200);

      expect(res.body).to.have.property('token');
      expect(res.body).to.have.property('expiresIn');
      authToken = res.body.token;
    });

    it('GET /api/users/profile should return user profile', async () => {
      const res = await request(BASE_URL)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body).to.have.property('username', testUser.username);
      expect(res.body).to.have.property('level');
      expect(res.body).to.have.property('xp');
    });
  });

  describe('Coupon Management', () => {
    it('GET /api/coupons/nearby should return nearby coupons', async () => {
      const res = await request(BASE_URL)
        .get('/api/coupons/nearby')
        .query({
          lat: 55.7558,
          lng: 37.6173,
          radius: 5000
        })
        .expect(200);

      expect(res.body).to.be.an('array');
      if (res.body.length > 0) {
        expect(res.body[0]).to.have.property('id');
        expect(res.body[0]).to.have.property('title');
        expect(res.body[0]).to.have.property('discount');
        expect(res.body[0]).to.have.property('rarity');
        expect(res.body[0]).to.have.property('latitude');
        expect(res.body[0]).to.have.property('longitude');
        expect(res.body[0]).to.have.property('distance');
      }
    });

    it('GET /api/coupons/:id should return coupon details', async () => {
      const res = await request(BASE_URL)
        .get('/api/coupons/test-coupon-id')
        .expect(200);

      expect(res.body).to.have.property('id');
      expect(res.body).to.have.property('title');
      expect(res.body).to.have.property('description');
    });

    it('POST /api/coupons/:id/catch should catch coupon', async () => {
      const res = await request(BASE_URL)
        .post('/api/coupons/test-coupon-id/catch')
        .send({
          userLat: 55.7558,
          userLng: 37.6173
        })
        .expect(200);

      expect(res.body).to.have.property('success', true);
      expect(res.body).to.have.property('xpGained');
    });
  });

  describe('LiminalDB Integration', () => {
    it('should store coupon catch event in LiminalDB', async () => {
      const catchRes = await request(BASE_URL)
        .post('/api/coupons/test-coupon-id/catch')
        .send({
          userLat: 55.7558,
          userLng: 37.6173
        })
        .expect(200);

      // Verify event was logged
      expect(catchRes.body).to.have.property('eventId');
    });

    it('should query user catch history from LiminalDB', async () => {
      const res = await request(BASE_URL)
        .get('/api/users/history')
        .query({ limit: 10 })
        .expect(200);

      expect(res.body).to.be.an('array');
    });
  });

  describe('Performance Tests', () => {
    it('should handle 100 concurrent requests', async function() {
      this.timeout(10000); // 10 second timeout

      const requests = Array(100).fill(null).map(() =>
        request(BASE_URL)
          .get('/health')
          .expect(200)
      );

      const results = await Promise.all(requests);
      expect(results).to.have.length(100);
    });

    it('GET /api/coupons/nearby should respond within 500ms', async () => {
      const start = Date.now();

      await request(BASE_URL)
        .get('/api/coupons/nearby')
        .query({
          lat: 55.7558,
          lng: 37.6173,
          radius: 5000
        })
        .expect(200);

      const duration = Date.now() - start;
      expect(duration).to.be.lessThan(500);
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent endpoint', async () => {
      await request(BASE_URL)
        .get('/api/nonexistent')
        .expect(404);
    });

    it('should return 400 for invalid coordinates', async () => {
      await request(BASE_URL)
        .get('/api/coupons/nearby')
        .query({
          lat: 'invalid',
          lng: 37.6173,
          radius: 5000
        })
        .expect(400);
    });

    it('should return 401 for unauthorized access', async () => {
      await request(BASE_URL)
        .get('/api/users/profile')
        .expect(401);
    });
  });
});
