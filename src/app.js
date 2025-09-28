const express = require('express');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const veo3Routes = require('./routes/veo3');
const connectDB = require('./lib/db');



const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// connect to MongoDB
connectDB();

// Routes
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', veo3Routes);

module.exports = app;
