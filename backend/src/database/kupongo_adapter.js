const LiminalClient = require('./liminal_client');
const { v4: uuidv4 } = require('uuid');
const geolib = require('geolib');

/**
 * KuponGo адаптер для LiminalDB
 * Упрощает работу с данными приложения
 */
class KuponGoAdapter {
  constructor(liminalUrl, options = {}) {
    this.client = new LiminalClient(liminalUrl, options);
    this.connected = false;
  }

  /**
   * Инициализация
   */
  async init() {
    await this.client.connect();
    this.connected = true;

    // Подписаться на метрики
    this.client.on('metrics', (metrics) => {
      console.log('[KuponGo] System metrics:', metrics);
    });

    // Подписаться на события
    this.client.on('event', (event) => {
      console.log('[KuponGo] Event:', event.ev, event.meta || {});
    });

    console.log('[KuponGo] Adapter initialized');
  }

  // ========== COUPONS ==========

  /**
   * Создать купон
   */
  async createCoupon(couponData) {
    const couponId = couponData.id || uuidv4();
    const geohash = this._encodeGeohash(couponData.latitude, couponData.longitude);

    const impulse = {
      k: 2, // Write
      p: `coupon/spawn/${couponId}`,
      s: this._getRarityStrength(couponData.rarity),
      t: this._getTTL(couponData.expires_at),
      tg: [
        couponData.rarity,
        couponData.category,
        couponData.business_name.toLowerCase().replace(/\s/g, '_'),
        `geo:${geohash}`,
        `lat:${Math.floor(couponData.latitude * 100)}`,
        `lng:${Math.floor(couponData.longitude * 100)}`
      ],
      meta: {
        ...couponData,
        id: couponId,
        created_at: Date.now()
      }
    };

    await this.client.push(impulse);

    return couponId;
  }

  /**
   * Получить купон по ID
   */
  async getCoupon(couponId) {
    const impulse = {
      k: 1, // Query
      p: `coupon/spawn/${couponId}`,
      s: 0.7,
      t: 3000
    };

    try {
      const result = await this.client.pushAndPull(impulse, 5000);
      return result.meta || null;
    } catch (err) {
      console.error('[KuponGo] Failed to get coupon:', err);
      return null;
    }
  }

  /**
   * Получить купоны рядом
   */
  async getCouponsNearby(lat, lng, radius = 1000) {
    // Используем LQL для поиска
    const latMin = Math.floor((lat - radius / 111000) * 100);
    const latMax = Math.floor((lat + radius / 111000) * 100);
    const lngMin = Math.floor((lng - radius / (111000 * Math.cos(lat * Math.PI / 180))) * 100);
    const lngMax = Math.floor((lng + radius / (111000 * Math.cos(lat * Math.PI / 180))) * 100);

    // Подписываемся на купоны в этой области
    const pattern = `coupon/spawn/*`;

    const impulse = {
      k: 1, // Query
      p: pattern,
      s: 0.7,
      t: 5000,
      tg: [
        `lat:${latMin}..${latMax}`,
        `lng:${lngMin}..${lngMax}`
      ]
    };

    try {
      const result = await this.client.pushAndPull(impulse, 5000);

      // В реальности нужно парсить события и фильтровать по расстоянию
      // Пока возвращаем mock данные
      return this._mockNearbyCoupons(lat, lng);
    } catch (err) {
      console.error('[KuponGo] Failed to get nearby coupons:', err);
      return [];
    }
  }

  /**
   * Поймать купон
   */
  async catchCoupon(userId, couponId, userLat, userLng) {
    const caughtId = uuidv4();

    // Сначала получаем данные купона
    const coupon = await this.getCoupon(couponId);

    if (!coupon) {
      throw new Error('Coupon not found');
    }

    // Проверяем расстояние
    const distance = geolib.getDistance(
      { latitude: userLat, longitude: userLng },
      { latitude: coupon.latitude, longitude: coupon.longitude }
    );

    if (distance > 100) {
      throw new Error('Too far from coupon');
    }

    // Создаем запись о пойманном купоне
    const impulse = {
      k: 2, // Write
      p: `caught/${userId}/${couponId}`,
      s: 1.0,
      t: 0,
      tg: [coupon.rarity, coupon.category, 'active'],
      meta: {
        id: caughtId,
        user_id: userId,
        coupon_id: couponId,
        caught_at: Date.now(),
        used_at: null,
        is_active: true,
        coupon: coupon
      }
    };

    await this.client.push(impulse);

    // Обновить статистику пользователя
    await this._incrementUserStat(userId, 'total_caught');

    // Начислить XP
    const xpGained = this._getXPForRarity(coupon.rarity);
    await this._addUserXP(userId, xpGained);

    return {
      caughtId,
      xpGained
    };
  }

  /**
   * Использовать купон
   */
  async useCoupon(userId, couponId) {
    const impulse = {
      k: 2, // Write
      p: `caught/${userId}/${couponId}/use`,
      s: 1.0,
      t: 0,
      meta: {
        used_at: Date.now(),
        is_active: false
      }
    };

    await this.client.push(impulse);

    // Генерировать QR код
    const qrCode = `KUPON-${couponId.slice(0, 8).toUpperCase()}`;

    return { qrCode };
  }

  /**
   * Получить купоны пользователя
   */
  async getUserCoupons(userId, active = true) {
    const status = active ? 'active' : 'used';

    const impulse = {
      k: 1, // Query
      p: `caught/${userId}/*`,
      s: 0.7,
      t: 5000,
      tg: [status]
    };

    try {
      const result = await this.client.pushAndPull(impulse, 5000);
      // В реальности парсить из events
      return [];
    } catch (err) {
      console.error('[KuponGo] Failed to get user coupons:', err);
      return [];
    }
  }

  // ========== USERS ==========

  /**
   * Зарегистрировать пользователя
   */
  async registerUser(username, email, passwordHash) {
    const userId = uuidv4();

    const impulse = {
      k: 2, // Write
      p: `user/register/${userId}`,
      s: 1.0,
      t: 0,
      tg: ['auth', 'new_user'],
      meta: {
        id: userId,
        username,
        email,
        password_hash: passwordHash,
        level: 1,
        xp: 0,
        total_caught: 0,
        rare_caught: 0,
        created_at: Date.now()
      }
    };

    await this.client.push(impulse);

    return userId;
  }

  /**
   * Получить пользователя по email
   */
  async getUserByEmail(email) {
    const impulse = {
      k: 1, // Query
      p: `user/email/${email.toLowerCase()}`,
      s: 0.8,
      t: 3000
    };

    try {
      const result = await this.client.pushAndPull(impulse, 5000);
      return result.meta || null;
    } catch (err) {
      return null;
    }
  }

  /**
   * Получить статистику пользователя
   */
  async getUserStats(userId) {
    const impulse = {
      k: 1, // Query
      p: `user/${userId}/stats`,
      s: 0.7,
      t: 3000
    };

    try {
      const result = await this.client.pushAndPull(impulse, 5000);
      return result.meta || this._mockUserStats();
    } catch (err) {
      return this._mockUserStats();
    }
  }

  /**
   * Увеличить счетчик пользователя
   */
  async _incrementUserStat(userId, field) {
    const impulse = {
      k: 0, // Affect
      p: `user/${userId}/stats/increment`,
      s: 0.8,
      t: 1000,
      meta: { field, value: 1 }
    };

    await this.client.push(impulse);
  }

  /**
   * Добавить XP пользователю
   */
  async _addUserXP(userId, xp) {
    const impulse = {
      k: 0, // Affect
      p: `user/${userId}/xp/add`,
      s: 0.9,
      t: 1000,
      meta: { xp }
    };

    await this.client.push(impulse);
  }

  // ========== BUSINESSES ==========

  /**
   * Создать бизнес
   */
  async createBusiness(businessData) {
    const businessId = businessData.id || uuidv4();

    const impulse = {
      k: 2, // Write
      p: `business/create/${businessId}`,
      s: 1.0,
      t: 0,
      tg: [businessData.category, businessData.subscription_tier],
      meta: {
        ...businessData,
        id: businessId,
        created_at: Date.now()
      }
    };

    await this.client.push(impulse);

    return businessId;
  }

  /**
   * Получить аналитику бизнеса
   */
  async getBusinessAnalytics(businessId) {
    const impulse = {
      k: 1, // Query
      p: `business/${businessId}/analytics`,
      s: 0.7,
      t: 5000
    };

    try {
      const result = await this.client.pushAndPull(impulse, 5000);
      return result.meta || this._mockBusinessAnalytics();
    } catch (err) {
      return this._mockBusinessAnalytics();
    }
  }

  // ========== UTILITIES ==========

  /**
   * Закодировать геохеш (упрощенная версия)
   */
  _encodeGeohash(lat, lng, precision = 6) {
    // Простая реализация - в production использовать библиотеку ngeohash
    const latStr = Math.floor(lat * 1000).toString(36);
    const lngStr = Math.floor(lng * 1000).toString(36);
    return (latStr + lngStr).substring(0, precision);
  }

  /**
   * Получить силу импульса по редкости
   */
  _getRarityStrength(rarity) {
    const strengths = {
      common: 0.5,
      rare: 0.7,
      epic: 0.85,
      legendary: 1.0
    };
    return strengths[rarity] || 0.6;
  }

  /**
   * Получить TTL до истечения
   */
  _getTTL(expiresAt) {
    const now = Date.now();
    const expiry = new Date(expiresAt).getTime();
    return Math.max(0, expiry - now);
  }

  /**
   * Получить XP за редкость
   */
  _getXPForRarity(rarity) {
    const xpMap = {
      common: 10,
      rare: 50,
      epic: 150,
      legendary: 500
    };
    return xpMap[rarity] || 10;
  }

  /**
   * Mock данные для купонов рядом
   */
  _mockNearbyCoupons(lat, lng) {
    return [
      {
        id: uuidv4(),
        title: 'Кофе -25%',
        business_name: 'Starbucks',
        discount_percent: 25,
        rarity: 'rare',
        distance: 125,
        latitude: lat + 0.001,
        longitude: lng + 0.001,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000)
      },
      {
        id: uuidv4(),
        title: 'Пицца -40%',
        business_name: 'Папа Джонс',
        discount_percent: 40,
        rarity: 'epic',
        distance: 340,
        latitude: lat + 0.003,
        longitude: lng - 0.002,
        expires_at: new Date(Date.now() + 12 * 60 * 60 * 1000)
      }
    ];
  }

  /**
   * Mock статистика пользователя
   */
  _mockUserStats() {
    return {
      level: 12,
      xp: 2450,
      xpToNextLevel: 6000,
      totalCaught: 247,
      byRarity: {
        common: 148,
        rare: 78,
        epic: 18,
        legendary: 3
      },
      totalSaved: 1247,
      distanceWalked: 42.3
    };
  }

  /**
   * Mock аналитика бизнеса
   */
  _mockBusinessAnalytics() {
    return {
      period: '7d',
      impressions: 1247,
      caught: 342,
      catchRate: 27.4,
      used: 189,
      usageRate: 55.2,
      newCustomers: 67
    };
  }

  /**
   * Закрыть соединение
   */
  async close() {
    this.client.close();
    this.connected = false;
  }
}

module.exports = KuponGoAdapter;
