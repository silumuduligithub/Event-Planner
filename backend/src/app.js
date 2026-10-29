const express = require('express');
const path = require('path');
const cors = require('cors');
const env = require('./config/env');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const authRoutes = require('./routes/authRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const eventRoutes = require('./routes/eventRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const allowedOrigins = env.CORS_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean);
app.disable('x-powered-by');
app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: '1mb' }));
app.get('/health', (req, res) => res.json({ success: true, message: 'API is running', data: null }));
app.use('/demo-media', express.static(path.join(__dirname, '..', 'public', 'demo')));
app.use('/api/auth', authRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
