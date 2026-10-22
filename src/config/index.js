require('dotenv').config();

module.exports = {
    port: process.env.PORT || 5000,
    mongoUri: process.env.mongo_uri,
    jwtSecret: process.env.JWT_SECRET || 'your_secret_key',
    redis: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: Number(process.env.REDIS_PORT || 6379),
        maxRetriesPerRequest: null, // required by BullMQ workers
    },
    runpod: {
        baseUrl: process.env.RUNPOD_BASE_URL,
        endpointId: process.env.RUNPOD_ENDPOINT_ID,
        apiKey: process.env.RUNPOD_API_KEY,
        pollMs: Number(process.env.RUNPOD_POLL_MS || 1500),
        timeoutMs: Number(process.env.RUNPOD_TIMEOUT_MS || 10 * 60 * 1000),
    },
    resultsDir: process.env.RESULTS_DIR || require('path').join(__dirname, '../../public/results'),
};
