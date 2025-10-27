const { v4: uuidv4 } = require('uuid');

// Mock businesses database
const mockBusinesses = [
  {
    id: uuidv4(),
    name: 'Starbucks',
    category: 'food',
    location_lat: 55.7558,
    location_lng: 37.6173,
    subscription_tier: 'premium',
    active_coupons_count: 5,
    created_at: new Date()
  },
  {
    id: uuidv4(),
    name: 'Папа Джонс',
    category: 'food',
    location_lat: 55.7520,
    location_lng: 37.6156,
    subscription_tier: 'basic',
    active_coupons_count: 2,
    created_at: new Date()
  }
];

/**
 * Получить все бизнесы
 */
async function getAllBusinesses(req, res) {
  try {
    res.json({
      success: true,
      count: mockBusinesses.length,
      businesses: mockBusinesses
    });
  } catch (error) {
    console.error('Error in getAllBusinesses:', error);
    res.status(500).json({
      error: 'Failed to fetch businesses'
    });
  }
}

/**
 * Получить бизнес по ID
 */
async function getBusinessById(req, res) {
  try {
    const { id } = req.params;

    const business = mockBusinesses.find(b => b.id === id);

    if (!business) {
      return res.status(404).json({
        error: 'Business not found'
      });
    }

    res.json({
      success: true,
      business
    });

  } catch (error) {
    console.error('Error in getBusinessById:', error);
    res.status(500).json({
      error: 'Failed to fetch business'
    });
  }
}

/**
 * Создать новый бизнес
 */
async function createBusiness(req, res) {
  try {
    const { name, category, location_lat, location_lng, subscription_tier } = req.body;

    if (!name || !category || !location_lat || !location_lng) {
      return res.status(400).json({
        error: 'Missing required fields'
      });
    }

    const business = {
      id: uuidv4(),
      name,
      category,
      location_lat: parseFloat(location_lat),
      location_lng: parseFloat(location_lng),
      subscription_tier: subscription_tier || 'basic',
      active_coupons_count: 0,
      created_at: new Date()
    };

    mockBusinesses.push(business);

    res.status(201).json({
      success: true,
      message: 'Business created successfully',
      business
    });

  } catch (error) {
    console.error('Error in createBusiness:', error);
    res.status(500).json({
      error: 'Failed to create business'
    });
  }
}

/**
 * Создать купон для бизнеса
 */
async function createCouponForBusiness(req, res) {
  try {
    const { id } = req.params;
    const { title, description, discount_percent, rarity, duration } = req.body;

    const business = mockBusinesses.find(b => b.id === id);

    if (!business) {
      return res.status(404).json({
        error: 'Business not found'
      });
    }

    // Проверка лимитов по подписке
    const limits = {
      basic: 50,
      premium: 150,
      enterprise: Infinity
    };

    const limit = limits[business.subscription_tier];

    if (business.active_coupons_count >= limit) {
      return res.status(400).json({
        error: 'Coupon limit reached for your subscription tier',
        currentCount: business.active_coupons_count,
        limit
      });
    }

    const coupon = {
      id: uuidv4(),
      business_id: id,
      business_name: business.name,
      title,
      description,
      discount_percent,
      rarity: rarity || 'common',
      category: business.category,
      latitude: business.location_lat,
      longitude: business.location_lng,
      spawn_radius: 50,
      expires_at: new Date(Date.now() + (duration || 24) * 60 * 60 * 1000),
      model_url: `/models/coupon_${rarity || 'common'}.gltf`,
      created_at: new Date()
    };

    business.active_coupons_count++;

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      coupon
    });

  } catch (error) {
    console.error('Error in createCouponForBusiness:', error);
    res.status(500).json({
      error: 'Failed to create coupon'
    });
  }
}

/**
 * Получить аналитику бизнеса
 */
async function getBusinessAnalytics(req, res) {
  try {
    const { id } = req.params;

    const business = mockBusinesses.find(b => b.id === id);

    if (!business) {
      return res.status(404).json({
        error: 'Business not found'
      });
    }

    // Mock analytics data
    const analytics = {
      period: '7d',
      impressions: 1247,
      caught: 342,
      catchRate: 27.4,
      used: 189,
      usageRate: 55.2,
      newCustomers: 67,
      estimatedRevenue: 8950,
      topCoupons: [
        { title: 'Кофе -25%', caught: 156 },
        { title: 'Ланч -20%', caught: 98 },
        { title: 'Десерт -15%', caught: 88 }
      ],
      hourlyDistribution: generateHourlyDistribution()
    };

    res.json({
      success: true,
      analytics
    });

  } catch (error) {
    console.error('Error in getBusinessAnalytics:', error);
    res.status(500).json({
      error: 'Failed to fetch analytics'
    });
  }
}

function generateHourlyDistribution() {
  const hours = [];
  for (let i = 0; i < 24; i++) {
    hours.push({
      hour: i,
      caught: Math.floor(Math.random() * 50)
    });
  }
  return hours;
}

module.exports = {
  getAllBusinesses,
  getBusinessById,
  createBusiness,
  createCouponForBusiness,
  getBusinessAnalytics
};
