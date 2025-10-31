const express = require('express');
const router = express.Router();
const {
  getCouponsNearby,
  getCouponById,
  catchCoupon,
  useCoupon,
  getUserCoupons
} = require('./controller');

// GET /api/coupons/nearby?lat=55.7558&lng=37.6173&radius=1000
router.get('/nearby', getCouponsNearby);

// GET /api/coupons/:id
router.get('/:id', getCouponById);

// POST /api/coupons/:id/catch
router.post('/:id/catch', catchCoupon);

// POST /api/coupons/:id/use
router.post('/:id/use', useCoupon);

// GET /api/coupons/user/:userId
router.get('/user/:userId', getUserCoupons);

module.exports = router;
