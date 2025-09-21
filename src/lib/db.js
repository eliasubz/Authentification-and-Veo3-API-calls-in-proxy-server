const mongoose = require('mongoose');
const { mongoUri } = require('../config'); // make sure config/index.js exports mongoUri

let conn = null;

async function connectDB() {
    if (conn) return conn; // reuse existing connection

    try {
        conn = await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('MongoDB connected');
        return conn;
    } catch (err) {
        console.error('MongoDB connection failed:', err);
        throw err;
    }
}

module.exports = connectDB;
