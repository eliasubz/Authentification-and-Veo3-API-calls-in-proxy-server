const express = require('express');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const veo3Routes = require('./routes/veo3');


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', veo3Routes);

module.exports = app;
