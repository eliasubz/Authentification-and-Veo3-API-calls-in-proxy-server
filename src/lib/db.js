// lib/db.js
const mongoose = require('mongoose');
let conn = null;
module.exports = async (mongoUri) => {
    if (conn) return conn;
    conn = await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
        .then(() => console.log('MongoDB connected'))
        .catch((err) => console.error('MongoDB connection failed:', err))
    return conn;
};
