const express = require('express');
const router = express.Router();
const {
  getAllBusinesses,
  getBusinessById,
  createBusiness,
  createCouponForBusiness,
  getBusinessAnalytics
} = require('./controller');

// GET /api/businesses
router.get('/', getAllBusinesses);

// GET /api/businesses/:id
router.get('/:id', getBusinessById);

// POST /api/businesses
router.post('/', createBusiness);

// POST /api/businesses/:id/coupons
router.post('/:id/coupons', createCouponForBusiness);

// GET /api/businesses/:id/analytics
router.get('/:id/analytics', getBusinessAnalytics);

module.exports = router;
