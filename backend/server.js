require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const equipmentRoutes = require('./routes/equipmentRoutes');
const requestRoutes = require('./routes/requestRoutes');
const reportRoutes = require('./routes/reportRoutes');
const maintenanceRoutes = require('./routes/maintanceRoutes');
const pdfRoutes = require('./routes/pdfRoutes');
const assignmentRoutes = require('./routes/assignmentsRoutes');
const vendorRoutes = require('./routes/vendorRoutes');

// Middleware Imports
const authMiddleware = require('./middleware/auth');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database Pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
});

// Test DB connection
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  client.query('SELECT NOW()', (err, result) => {
    release();
    if (err) {
      return console.error('Error executing query', err.stack);
    }
    console.log('Database connected successfully');
  });
});
// Public Routes
app.use('/api/auth', authRoutes);

// Protected Routes
app.use('/api/equipment', authMiddleware, equipmentRoutes);
app.use('/api/requests', authMiddleware, requestRoutes);
app.use('/api/reports', authMiddleware, reportRoutes);
app.use('/api/maintenance', authMiddleware, maintenanceRoutes);
app.use('/api/pdf', authMiddleware, pdfRoutes);
app.use('/api/assignments', authMiddleware, assignmentRoutes);
app.use('/api/vendors', authMiddleware, vendorRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = pool;
