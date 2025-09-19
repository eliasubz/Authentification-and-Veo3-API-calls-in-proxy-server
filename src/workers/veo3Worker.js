// workers/veo3Worker.js
const { Worker } = require('bullmq');
const IORedis = require('ioredis');
const { generateSomething } = require('../services/veo3Service');
const Veo3Job = require('../models/Veo3Job');

const connection = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
    maxRetriesPerRequest: null,   // <-- required for BullMQ
});

const veo3Worker = new Worker(
    'veo3',
    async (job) => {
        console.log(`Processing Veo3 job ${job.id} for user ${job.data.userId}`);

        // 1. Call external API
        const result = await generateSomething(job.data.params);

        // 2. Update job status in DB
        await Veo3Job.findByIdAndUpdate(job.data.jobId, {
            status: 'completed',
            result,
            completedAt: new Date(),
        });

        console.log(`Veo3 job ${job.id} completed!`);
        return result;
    },
    { connection }
);

veo3Worker.on('completed', (job) => {
    console.log(`Job ${job.id} has been completed`);
});

veo3Worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed:`, err.message);
});

module.exports = veo3Worker;
