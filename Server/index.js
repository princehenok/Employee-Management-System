const express = require('express');
const cors = require('cors');
const app = express();

const sequelize = require('./config/database');
const Employee = require('./models/employee');
const employeeRoutes = require('./routes/employeeRoutes');

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.use('/api/employees', employeeRoutes);

// Optional: Root route for browser testing
app.get('/', (req, res) => {
  res.send('👋 Welcome to the Employee API. Try /api/employees to view employee data.');
});

// Sync DB and start server
sequelize.sync({ force: false })  // Set to true ONLY if you want to drop and recreate tables
  .then(() => {
    console.log('📦 Database synced – tables should now exist!');
    app.listen(3000, () => {
      console.log('🚀 Server is live on http://localhost:3000');
    });
  })
  .catch((err) => {
    console.error('❌ Unable to sync database:', err);
  });
