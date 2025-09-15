const express = require('express');
const mongoose = require('mongoose');
// const registerRoute = require('../node_modules/routes/register'); // adjust path if needed


const app = express();
// Middleware to parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
// app.use(registerRoute);

// testing environment variable
require('dotenv').config();
mongo_connection_url = process.env.mongo_uri
// Connect to MongoDB
mongoose.connect(mongo_connection_url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection failed:', err));

// Start the server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Register Users 
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const User = require('../models/User.js');

app.post('/api/register',
  [
    body('email').isEmail().withMessage('Enter a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    // console.log(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { username, email, password } = req.body;
    console.log("This is the server: ", req.body)

    try {
      console.log(username, email, password)
      const hashedPassword = await bcrypt.hash(password, 10);
      let permission = 'user';
      if (username == "Joao") {
        permission = 'admin';
      } else {
        console.log("Username: ", username)
      }
      console.log(permission)
      const user = new User({ username, email, password: hashedPassword, role: permission });
      await user.save();
      res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
      console.log("We got until here but this would mean we have an error status 500")
      res.status(500).json({ message: 'Error registering user', error: err.message });
    }
  }
);

// Authenticate Users
const jwt = require('jsonwebtoken');

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Email not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, 'your_secret_key', { expiresIn: '1h' });
    res.status(200).json({ token, message: 'Logged in successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error logging in', error: err.message });
  }
});

// Get Role
app.get('/api/get_Role')

// Create Middleware 
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

  try {
    const decoded = jwt.verify(token, 'your_secret_key');
    req.user = decoded;
    next();
  } catch (err) {

    res.status(400).json({ message: `Invalid token ${token}` });
  }
};

const roleMiddleware = (requiredRole) => (req, res, next) => {

  if (req.user.role !== requiredRole) return res.status(403).json({ message: `Access forbidden ${req.user.role}` });
  next();
};

app.get('/api/user', authMiddleware, (req, res) => {
  res.status(200).json({ message: 'Welcome to the user dashboard', user: req.user });
});

app.get('/api/admin', [authMiddleware, roleMiddleware('admin')], (req, res) => {
  res.status(200).json({ message: 'Welcome to the admin dashboard', user: req.user });
});