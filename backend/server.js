require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import routes
const couponsRouter = require('./src/api/coupons/routes');
const usersRouter = require('./src/api/users/routes');
const businessesRouter = require('./src/api/businesses/routes');

// Import services
const { startCouponSpawner } = require('./src/services/spawner');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/coupons', couponsRouter);
app.use('/api/users', usersRouter);
app.use('/api/businesses', businessesRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'KuponGo API Server',
    version: '1.0.0',
    endpoints: {
      coupons: '/api/coupons',
      users: '/api/users',
      businesses: '/api/businesses',
      health: '/health'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: 'Route not found',
      status: 404
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════════════════╗
  ║          KuponGo Backend API Server            ║
  ╠════════════════════════════════════════════════╣
  ║  🚀 Server running on port: ${PORT}                ║
  ║  📡 API available at: http://localhost:${PORT}   ║
  ║  🌍 Environment: ${process.env.NODE_ENV || 'development'}              ║
  ╚════════════════════════════════════════════════╝
  `);

  // Start coupon spawner service
  if (process.env.NODE_ENV !== 'test') {
    startCouponSpawner();
    console.log('  ✅ Coupon spawner service started');
  }
});

module.exports = app;
