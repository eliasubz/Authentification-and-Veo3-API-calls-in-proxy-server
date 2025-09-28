// services/queueService.js
const { Queue } = require('bullmq');
const IORedis = require('ioredis');
require('dotenv').config();


// connect to redis (default local, or use REDIS_URL env var)
const connection = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');

connection.on("connect", () => {
    console.log("Redis connected");
});

connection.on("error", (err) => {
    console.error("Redis connection failed:", err);
});

const veo3Queue = new Queue('veo3', { connection });

async function enqueue(queueName, data) {
    const queue = queueName === 'veo3' ? veo3Queue : null;
    if (!queue) throw new Error(`Queue ${queueName} not found`);
    const job = await queue.add('task', data, { attempts: 3, removeOnComplete: true });
    return job;
}

module.exports = {
    enqueue,
    veo3Queue,
};