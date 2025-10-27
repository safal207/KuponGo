const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  getUserStats
} = require('./controller');

// POST /api/users/register
router.post('/register', registerUser);

// POST /api/users/login
router.post('/login', loginUser);

// GET /api/users/:id
router.get('/:id', getUserProfile);

// GET /api/users/:id/stats
router.get('/:id/stats', getUserStats);

module.exports = router;
