const { getDistance } = require('geolib');
const { v4: uuidv4 } = require('uuid');

// Mock data для демо (позже заменить на реальную БД)
const mockCoupons = [
  {
    id: uuidv4(),
    business_id: uuidv4(),
    business_name: 'Starbucks',
    title: 'Кофе -25%',
    description: 'Скидка 25% на любой напиток',
    discount_percent: 25,
    rarity: 'rare',
    category: 'food',
    latitude: 55.7558,
    longitude: 37.6173,
    spawn_radius: 50,
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // +24 hours
    model_url: '/models/coupon_rare.gltf',
    created_at: new Date()
  },
  {
    id: uuidv4(),
    business_id: uuidv4(),
    business_name: 'Папа Джонс',
    title: 'Пицца -40%',
    description: 'Скидка 40% на большую пиццу',
    discount_percent: 40,
    rarity: 'epic',
    category: 'food',
    latitude: 55.7520,
    longitude: 37.6156,
    spawn_radius: 50,
    expires_at: new Date(Date.now() + 12 * 60 * 60 * 1000), // +12 hours
    model_url: '/models/coupon_epic.gltf',
    created_at: new Date()
  },
  {
    id: uuidv4(),
    business_id: uuidv4(),
    business_name: 'H&M',
    title: 'Одежда -30%',
    description: 'Скидка 30% на весь ассортимент',
    discount_percent: 30,
    rarity: 'rare',
    category: 'clothes',
    latitude: 55.7600,
    longitude: 37.6200,
    spawn_radius: 50,
    expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000), // +48 hours
    model_url: '/models/coupon_rare.gltf',
    created_at: new Date()
  }
];

const mockCaughtCoupons = [];

/**
 * Получить купоны рядом с пользователем
 */
async function getCouponsNearby(req, res) {
  try {
    const { lat, lng, radius = 1000 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        error: 'Missing required parameters: lat, lng'
      });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const searchRadius = parseInt(radius);

    // Фильтр купонов по расстоянию
    const nearbyCoupons = mockCoupons.filter(coupon => {
      const distance = getDistance(
        { latitude: userLat, longitude: userLng },
        { latitude: coupon.latitude, longitude: coupon.longitude }
      );

      return distance <= searchRadius;
    }).map(coupon => {
      // Добавить расстояние к каждому купону
      const distance = getDistance(
        { latitude: userLat, longitude: userLng },
        { latitude: coupon.latitude, longitude: coupon.longitude }
      );

      return {
        ...coupon,
        distance
      };
    });

    // Сортировка по расстоянию
    nearbyCoupons.sort((a, b) => a.distance - b.distance);

    res.json({
      success: true,
      count: nearbyCoupons.length,
      coupons: nearbyCoupons
    });

  } catch (error) {
    console.error('Error in getCouponsNearby:', error);
    res.status(500).json({
      error: 'Failed to fetch nearby coupons'
    });
  }
}

/**
 * Получить купон по ID
 */
async function getCouponById(req, res) {
  try {
    const { id } = req.params;

    const coupon = mockCoupons.find(c => c.id === id);

    if (!coupon) {
      return res.status(404).json({
        error: 'Coupon not found'
      });
    }

    res.json({
      success: true,
      coupon
    });

  } catch (error) {
    console.error('Error in getCouponById:', error);
    res.status(500).json({
      error: 'Failed to fetch coupon'
    });
  }
}

/**
 * Поймать купон
 */
async function catchCoupon(req, res) {
  try {
    const { id } = req.params;
    const { userId, userLat, userLng } = req.body;

    if (!userId || !userLat || !userLng) {
      return res.status(400).json({
        error: 'Missing required fields: userId, userLat, userLng'
      });
    }

    const coupon = mockCoupons.find(c => c.id === id);

    if (!coupon) {
      return res.status(404).json({
        error: 'Coupon not found'
      });
    }

    // Проверка расстояния
    const distance = getDistance(
      { latitude: userLat, longitude: userLng },
      { latitude: coupon.latitude, longitude: coupon.longitude }
    );

    const MAX_CATCH_DISTANCE = 100; // метров

    if (distance > MAX_CATCH_DISTANCE) {
      return res.status(400).json({
        error: 'Too far from coupon',
        distance,
        maxDistance: MAX_CATCH_DISTANCE
      });
    }

    // Проверка что купон еще не истек
    if (new Date() > new Date(coupon.expires_at)) {
      return res.status(400).json({
        error: 'Coupon has expired'
      });
    }

    // Проверка что пользователь еще не поймал этот купон
    const alreadyCaught = mockCaughtCoupons.find(
      cc => cc.coupon_id === id && cc.user_id === userId
    );

    if (alreadyCaught) {
      return res.status(400).json({
        error: 'Coupon already caught by this user'
      });
    }

    // Сохранить пойманный купон
    const caughtCoupon = {
      id: uuidv4(),
      user_id: userId,
      coupon_id: id,
      caught_at: new Date(),
      used_at: null,
      is_active: true,
      coupon: coupon
    };

    mockCaughtCoupons.push(caughtCoupon);

    // Начислить XP (по редкости)
    const xpRewards = {
      common: 10,
      rare: 50,
      epic: 150,
      legendary: 500
    };

    const xpGained = xpRewards[coupon.rarity] || 10;

    res.json({
      success: true,
      message: 'Coupon caught successfully!',
      caughtCoupon,
      xpGained
    });

  } catch (error) {
    console.error('Error in catchCoupon:', error);
    res.status(500).json({
      error: 'Failed to catch coupon'
    });
  }
}

/**
 * Использовать купон
 */
async function useCoupon(req, res) {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        error: 'Missing required field: userId'
      });
    }

    const caughtCoupon = mockCaughtCoupons.find(
      cc => cc.coupon_id === id && cc.user_id === userId && cc.is_active
    );

    if (!caughtCoupon) {
      return res.status(404).json({
        error: 'Caught coupon not found or already used'
      });
    }

    // Отметить как использованный
    caughtCoupon.used_at = new Date();
    caughtCoupon.is_active = false;

    // Сгенерировать QR код (в реальности это будет уникальный код)
    const qrCode = `KUPON-${caughtCoupon.id.slice(0, 8).toUpperCase()}`;

    res.json({
      success: true,
      message: 'Coupon used successfully!',
      qrCode,
      usedCoupon: caughtCoupon
    });

  } catch (error) {
    console.error('Error in useCoupon:', error);
    res.status(500).json({
      error: 'Failed to use coupon'
    });
  }
}

/**
 * Получить купоны пользователя
 */
async function getUserCoupons(req, res) {
  try {
    const { userId } = req.params;
    const { active = 'true' } = req.query;

    const isActive = active === 'true';

    const userCoupons = mockCaughtCoupons.filter(
      cc => cc.user_id === userId && (isActive ? cc.is_active : !cc.is_active)
    );

    res.json({
      success: true,
      count: userCoupons.length,
      coupons: userCoupons
    });

  } catch (error) {
    console.error('Error in getUserCoupons:', error);
    res.status(500).json({
      error: 'Failed to fetch user coupons'
    });
  }
}

module.exports = {
  getCouponsNearby,
  getCouponById,
  catchCoupon,
  useCoupon,
  getUserCoupons
};
