const express = require('express');
const { storage } = require('./config');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const veo3Routes = require('./routes/veo3');
const petRoutes = require('./routes/pets');


const app = express();

app.use(express.json({ limit: '50mb' })); // up to 10 pet photos arrive as base64
app.use(express.urlencoded({ extended: true }));

// Local-storage mode only: serves /results/* and /pets/* (with R2, files come from the bucket URL)
app.use(express.static(storage.localDir));

// Routes
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', veo3Routes);
app.use('/api', petRoutes);

module.exports = app;
