/**
 * PhotoAI Backend Server
 * Express.js API Server
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const { initCronJobs } = require('./cron/cleanupService'); // Import cron service

// Initialize Express app
const app = express();

// Initialize scheduled tasks
initCronJobs();

// Configuration
// Configuration
const PORT = process.env.PORT || 5001;
const envOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [];
const allowedOrigins = [
    ...envOrigins,
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175'
].filter(Boolean);

// Middleware
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // In development, allow all origins
        if (process.env.NODE_ENV === 'development') {
            return callback(null, true);
        }

        if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.ngrok-free.dev')) {
            return callback(null, true);
        } else {
            return callback(new Error('The CORS policy for this site does not allow access from the specified Origin.'), false);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'ngrok-skip-browser-warning', 'x-freepik-api-key']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging and security headers
app.use((req, res, next) => {
    // Required for Google OAuth popups
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Static file serving for generated images
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api', routes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        name: 'PhotoAI API',
        version: '1.0.0',
        description: 'AI Product Image Generator API',
        documentation: '/api/docs',
        health: '/api/health',
    });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found',
        path: req.path,
    });
});

// Error Handler
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
});

// Start server
const server = app.listen(PORT, () => {
    console.log(`
  ╔═══════════════════════════════════════════╗
  ║                                           ║
  ║   🚀 PhotoAI API Server                   ║
  ║                                           ║
  ║   Running on: http://localhost:${PORT}       ║
  ║   Environment: ${process.env.NODE_ENV || 'development'}            ║
  ║                                           ║
  ╚═══════════════════════════════════════════╝
  `);
});

server.timeout = 600000; // Set server timeout to 10 minutes


module.exports = app;
