const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const userRoutes = require('./routes/userRoutes');
const User = require('./models/users'); // Make sure you import your User model

const app = express();
const PORT = 3000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173'
}));
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);

// Add this new root route to fetch all users
app.get('/', async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the server after DB connection
(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to the database.');
    await sequelize.sync(); // Make sure tables are created
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
  }
})();