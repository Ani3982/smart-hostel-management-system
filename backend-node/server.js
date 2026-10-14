const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const pool = require('./config/db');
const { seedInitialData } = require('./utils/seed');

const authRoutes = require('./routes/auth');
const hostelRoutes = require('./routes/hostels');
const roomRoutes = require('./routes/rooms');
const bedRoutes = require('./routes/beds');
const applicationRoutes = require('./routes/applications');
const allocationRoutes = require('./routes/allocations');
const paymentRoutes = require('./routes/payments');
const studentRoutes = require('./routes/students');
const dashboardRoutes = require('./routes/dashboard');
const notificationRoutes = require('./routes/notifications');
const documentRoutes = require('./routes/documents');
const wardenRoutes = require('./routes/warden');
const complaintRoutes = require('./routes/complaints');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'UP',
    backend: 'Node.js Express',
    database: 'MySQL 8.0',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/hostels', hostelRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/beds', bedRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/allocations', allocationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/warden', wardenRoutes);
app.use('/api/complaints', complaintRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    data: null
  });
});

// Start Server
app.listen(PORT, async () => {
  console.log(`======================================================================`);
  console.log(`  Online Hostel Management System - Node.js Backend Server`);
  console.log(`  College: New Arts, Commerce and Science College, Ahilyanagar`);
  console.log(`  Port: ${PORT} | Database: MySQL 8.0 (hostel_management_db)`);
  console.log(`======================================================================`);
  
  // Test DB connection and seed check
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS solution');
    console.log(`✓ Connected to MySQL Server 8.0 successfully (db: hostel_management_db)`);
    await seedInitialData();
  } catch (err) {
    console.error(`✗ MySQL connection error:`, err.message);
  }
});
