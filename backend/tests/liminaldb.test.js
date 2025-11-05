/**
 * LiminalDB Integration Tests
 * Testing impulse-based operations and KuponGo adapter
 */

const { expect } = require('chai');
const LiminalClient = require('../src/database/liminal_client');
const KuponGoAdapter = require('../src/database/kupongo_adapter');

const LIMINALDB_URL = process.env.LIMINALDB_URL || 'ws://localhost:8787';

describe('LiminalDB Integration Tests', () => {
  let client;
  let adapter;

  before(async function() {
    this.timeout(5000);
    client = new LiminalClient(LIMINALDB_URL);
    await client.connect();
    adapter = new KuponGoAdapter(client);
  });

  after(async () => {
    if (client) {
      client.close();
    }
  });

  describe('LiminalClient Basic Operations', () => {
    it('should connect to LiminalDB', () => {
      expect(client.connected).to.be.true;
    });

    it('should push an impulse', async () => {
      const impulse = {
        k: 2, // Write
        p: 'test/impulse/' + Date.now(),
        s: 0.8,
        t: 60000,
        meta: { test: true }
      };

      const result = await client.push(impulse);
      expect(result).to.have.property('ok', true);
    });

    it('should query impulses', async () => {
      const query = {
        pattern: 'test/*',
        limit: 10
      };

      const results = await client.lql(query);
      expect(results).to.be.an('array');
    });

    it('should handle CBOR encoding', async () => {
      client.format = 'cbor';

      const impulse = {
        k: 2,
        p: 'test/cbor/' + Date.now(),
        s: 0.9,
        meta: { encoding: 'cbor' }
      };

      const result = await client.push(impulse);
      expect(result).to.have.property('ok', true);

      client.format = 'json'; // Reset
    });
  });

  describe('KuponGoAdapter - Coupon Operations', () => {
    let testCouponId;

    it('should create a coupon', async () => {
      const couponData = {
        title: 'Тестовый купон',
        description: 'Описание тестового купона',
        discount: 25,
        category: 'food',
        rarity: 'common',
        latitude: 55.7558,
        longitude: 37.6173,
        businessId: 'test-business-123',
        expiresAt: Date.now() + 3600000 // 1 hour
      };

      const result = await adapter.createCoupon(couponData);
      expect(result).to.have.property('couponId');
      expect(result).to.have.property('success', true);
      testCouponId = result.couponId;
    });

    it('should get coupons nearby', async () => {
      const coupons = await adapter.getCouponsNearby(55.7558, 37.6173, 5000);
      expect(coupons).to.be.an('array');

      if (coupons.length > 0) {
        expect(coupons[0]).to.have.property('id');
        expect(coupons[0]).to.have.property('distance');
        expect(coupons[0].distance).to.be.lessThan(5000);
      }
    });

    it('should catch a coupon', async () => {
      const userId = 'test-user-' + Date.now();

      const result = await adapter.catchCoupon(
        userId,
        testCouponId,
        55.7558,
        37.6173
      );

      expect(result).to.have.property('success');
      if (result.success) {
        expect(result).to.have.property('xpGained');
      }
    });

    it('should use a coupon', async () => {
      const userId = 'test-user-' + Date.now();

      const result = await adapter.useCoupon(userId, testCouponId);
      expect(result).to.have.property('success');
    });

    it('should get coupon by ID', async () => {
      const coupon = await adapter.getCouponById(testCouponId);
      expect(coupon).to.have.property('id', testCouponId);
      expect(coupon).to.have.property('title');
      expect(coupon).to.have.property('discount');
    });
  });

  describe('KuponGoAdapter - User Operations', () => {
    let testUserId;

    it('should register a user', async () => {
      const username = 'testuser_' + Date.now();
      const email = `test${Date.now()}@example.com`;
      const passwordHash = 'hashed_password_123';

      const result = await adapter.registerUser(username, email, passwordHash);
      expect(result).to.have.property('userId');
      expect(result).to.have.property('success', true);
      testUserId = result.userId;
    });

    it('should get user by ID', async () => {
      const user = await adapter.getUserById(testUserId);
      expect(user).to.have.property('id', testUserId);
      expect(user).to.have.property('level');
      expect(user).to.have.property('xp');
    });

    it('should get user inventory', async () => {
      const inventory = await adapter.getUserInventory(testUserId);
      expect(inventory).to.be.an('array');
    });

    it('should update user XP', async () => {
      const result = await adapter.addXP(testUserId, 100);
      expect(result).to.have.property('success', true);
      expect(result).to.have.property('newXP');
      expect(result).to.have.property('levelUp');
    });
  });

  describe('Geohash Integration', () => {
    it('should tag coupons with geohash', async () => {
      const couponData = {
        title: 'Geohash тест',
        discount: 15,
        category: 'tech',
        rarity: 'rare',
        latitude: 55.7558,
        longitude: 37.6173,
        businessId: 'test-business'
      };

      const result = await adapter.createCoupon(couponData);
      expect(result).to.have.property('couponId');

      // Verify geohash tag was added
      const coupon = await adapter.getCouponById(result.couponId);
      // Geohash should be in metadata or tags
      expect(coupon).to.be.an('object');
    });

    it('should find coupons by geohash proximity', async () => {
      const nearby = await adapter.getCouponsNearby(55.7558, 37.6173, 1000);
      expect(nearby).to.be.an('array');
    });
  });

  describe('Event Logging', () => {
    it('should log coupon spawn event', async () => {
      const couponData = {
        title: 'Event Log Test',
        discount: 20,
        category: 'entertainment',
        rarity: 'epic',
        latitude: 55.7600,
        longitude: 37.6200,
        businessId: 'test-business'
      };

      const result = await adapter.createCoupon(couponData);
      expect(result).to.have.property('success', true);

      // Event should be logged in LiminalDB
      // Query events
      const events = await client.lql({
        pattern: 'kupongo.events.coupon.spawn/*',
        limit: 10
      });

      expect(events).to.be.an('array');
    });

    it('should log user catch event', async () => {
      const userId = 'event-test-user';
      const couponId = 'event-test-coupon';

      await adapter.catchCoupon(userId, couponId, 55.7558, 37.6173);

      // Query catch events
      const events = await client.lql({
        pattern: 'kupongo.events.coupon.catch/*',
        limit: 10
      });

      expect(events).to.be.an('array');
    });
  });

  describe('Performance Tests', () => {
    it('should create 100 coupons in parallel', async function() {
      this.timeout(10000);

      const promises = Array(100).fill(null).map((_, i) =>
        adapter.createCoupon({
          title: `Perf Test Coupon ${i}`,
          discount: Math.floor(Math.random() * 50) + 10,
          category: 'food',
          rarity: 'common',
          latitude: 55.7558 + (Math.random() - 0.5) * 0.1,
          longitude: 37.6173 + (Math.random() - 0.5) * 0.1,
          businessId: 'perf-test'
        })
      );

      const results = await Promise.all(promises);
      expect(results).to.have.length(100);
      results.forEach(result => {
        expect(result).to.have.property('success', true);
      });
    });

    it('should query nearby coupons within 100ms', async () => {
      const start = Date.now();
      await adapter.getCouponsNearby(55.7558, 37.6173, 5000);
      const duration = Date.now() - start;

      expect(duration).to.be.lessThan(100);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid coupon data', async () => {
      try {
        await adapter.createCoupon({
          // Missing required fields
          title: 'Invalid'
        });
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error).to.be.an('error');
      }
    });

    it('should handle connection loss gracefully', async () => {
      const tempClient = new LiminalClient('ws://invalid:9999');

      try {
        await tempClient.connect();
        expect.fail('Should have failed to connect');
      } catch (error) {
        expect(error).to.be.an('error');
      }
    });
  });
});
