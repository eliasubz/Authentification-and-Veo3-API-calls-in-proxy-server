require('dotenv').config();

module.exports = {
    port: process.env.PORT || 5000,
    mongoUri: process.env.mongo_uri,
    jwtSecret: process.env.JWT_SECRET || 'your_secret_key',
};
