const express = require('express');
const cors = require('cors');
const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User.js');
const cookieParser = require('cookie-parser');

require('dotenv').config();

const app = express();

// Database connection once at the start
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Database connection failed:", err));

const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = process.env.JWT_SECRET || 'your-secret-key'; // Use an environment variable for the secret

app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname + '/uploads'));
app.use(cors({
  credentials: true,
  origin: 'http://localhost:5173', // Adjust if frontend is running on a different port
}));

// Utility function to extract user data from JWT
function getUserDataFromReq(req) {
  return new Promise((resolve, reject) => {
    jwt.verify(req.cookies.token, jwtSecret, {}, async (err, userData) => {
      if (err) return reject(err); // Handle error properly
      resolve(userData);
    });
  });
}

// Test endpoint to check if server is running
app.get('/api/test', (req, res) => {
  res.json('test ok');
});

// Registration endpoint
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;
  
  // Basic form validation
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(422).json({ error: 'User already exists.' });
    }

    // Create new user document
    const userDoc = await User.create({
      name,
      email,
      password: bcrypt.hashSync(password, bcryptSalt),
    });

    res.status(201).json(userDoc); // Return user document on successful registration
  } catch (e) {
    console.error(e); // Log error for debugging
    res.status(500).json({ error: e.message || 'Registration failed' });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const userDoc = await User.findOne({ email });
    
    if (userDoc) {
      const passOk = bcrypt.compareSync(password, userDoc.password);
      
      if (passOk) {
        jwt.sign(
          { email: userDoc.email, id: userDoc._id },
          jwtSecret,
          { expiresIn: '1d' }, // Add an expiration for security
          (err, token) => {
            if (err) return res.status(500).json({ error: 'Token generation failed' });
            res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' }).json(userDoc);
          }
        );
      } else {
        res.status(422).json({ error: 'Incorrect password' });
      }
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Login failed. Please try again later.' });
  }
});

// Start server
app.listen(5278, () => {
  console.log('Server running on port 5278');
});
