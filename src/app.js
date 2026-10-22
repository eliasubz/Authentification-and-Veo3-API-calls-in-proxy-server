const express = require('express');
const { resultsDir } = require('./config');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const veo3Routes = require('./routes/veo3');


const app = express();

app.use(express.json({ limit: '15mb' })); // pet photos arrive as base64
app.use(express.urlencoded({ extended: true }));

app.use('/results', express.static(resultsDir));

// Routes
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', veo3Routes);

module.exports = app;
