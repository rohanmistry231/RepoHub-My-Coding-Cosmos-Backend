require("dotenv").config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet'); // Added helmet for security headers
const repoRoutes = require('./routes/repoRoutes');

const app = express();

// Middleware
app.use(helmet()); // Added helmet middleware
app.use(cors({ origin: '*' })); // Allow requests from any origin
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/', repoRoutes);
app.get('/', (req, res) => {
  res.send('Welcome to the Repo API');  
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});