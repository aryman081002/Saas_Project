require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// Middleware
// ============================================
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// Serve static frontend files
// ============================================
app.use(express.static(path.join(__dirname, '..')));

// ============================================
// API Routes
// ============================================
app.use('/api/auth', require('./routes/auth'));
app.use('/api/clients', require('./routes/clients'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/dashboard', require('./routes/dashboard'));

// ============================================
// Health check endpoint
// ============================================
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'TechFlow API is running',
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// Serve frontend for all non-API routes
// ============================================
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'dashboard.html'));
});

// ============================================
// 404 handler for unknown API routes
// ============================================
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ============================================
// Global error handler
// ============================================
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'development'
      ? err.message
      : 'Internal server error.',
  });
});

// ============================================
// Start server
// ============================================
app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════╗
  ║   🚀 TechFlow API Server                 ║
  ║   Running on: http://localhost:${PORT}      ║
  ║   Environment: ${process.env.NODE_ENV || 'development'}            ║
  ╚═══════════════════════════════════════════╝
  `);
});
