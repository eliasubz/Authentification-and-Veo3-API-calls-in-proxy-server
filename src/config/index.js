require('dotenv').config();
const path = require('path');

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
        apiKey: process.env.RUNPOD_API_KEY,
        pollMs: Number(process.env.RUNPOD_POLL_MS || 1500),
        // RUNPOD_FAKE=1 returns placeholder results instantly, for testing without a GPU
        fake: process.env.RUNPOD_FAKE === '1',
        generate: {
            endpointId: process.env.RUNPOD_ENDPOINT_ID,
            baseUrl: process.env.RUNPOD_BASE_URL,
            timeoutMs: Number(process.env.RUNPOD_TIMEOUT_MS || 10 * 60 * 1000),
        },
        train: {
            endpointId: process.env.RUNPOD_TRAIN_ENDPOINT_ID,
            baseUrl: process.env.RUNPOD_TRAIN_BASE_URL,
            timeoutMs: Number(process.env.RUNPOD_TRAIN_TIMEOUT_MS || 45 * 60 * 1000),
        },
    },
    storage: {
        // S3-compatible bucket (Cloudflare R2); falls back to local disk when unset
        bucket: process.env.S3_BUCKET,
        endpoint: process.env.S3_ENDPOINT,
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_KEY,
        publicUrl: process.env.S3_PUBLIC_URL,
        localDir: process.env.LOCAL_STORAGE_DIR || path.join(__dirname, '../../public'),
    },
    trainCost: Number(process.env.TRAIN_COST || 5),
};
