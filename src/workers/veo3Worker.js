const fs = require('fs/promises');
const path = require('path');
const { Worker } = require('bullmq');
const mongoose = require('mongoose');
const Veo3Job = require('../models/Veo3Job');
const User = require('../models/User');
const { generateImage } = require('../services/runpodApi');
const { mongoUri, redis, resultsDir } = require('../config');

mongoose.connect(mongoUri)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection failed:', err));

// Only forward the fields the GPU worker understands.
const INPUT_KEYS = ['prompt', 'pet_image', 'negative_prompt', 'ip_adapter_scale', 'steps', 'guidance_scale', 'width', 'height', 'seed'];

const veo3Worker = new Worker(
    'veo3',
    async (job) => {
        console.log(`Processing job ${job.id} for user ${job.data.userId}`);

        await Veo3Job.findByIdAndUpdate(job.data.jobId, { status: 'running', startedAt: new Date() });

        const input = Object.fromEntries(INPUT_KEYS.filter((k) => job.data.params[k] !== undefined).map((k) => [k, job.data.params[k]]));
        const { image_base64, ...metrics } = await generateImage(input);

        await fs.mkdir(resultsDir, { recursive: true });
        const fileName = `${job.data.jobId}.png`;
        await fs.writeFile(path.join(resultsDir, fileName), Buffer.from(image_base64, 'base64'));

        await Veo3Job.findByIdAndUpdate(job.data.jobId, {
            status: 'completed',
            resultUrl: `/results/${fileName}`,
            metrics,
            completedAt: new Date(),
        });

        console.log(`Job ${job.id} completed: inference ${metrics.timings_ms?.inference?.toFixed(0)}ms, end-to-end ${metrics.endToEndMs}ms`);
        return { resultUrl: `/results/${fileName}` };
    },
    { connection: redis, concurrency: Number(process.env.WORKER_CONCURRENCY || 4) }
);

veo3Worker.on('failed', async (job, err) => {
    console.error(`Job ${job?.id} failed:`, err.message);
    if (!job || job.attemptsMade < job.opts.attempts) return;
    // Final failure: mark it and refund the reserved credits.
    const record = await Veo3Job.findByIdAndUpdate(job.data.jobId, { status: 'failed', error: err.message });
    if (record) await User.findByIdAndUpdate(record.owner, { $inc: { credits: record.creditsUsed } });
});

module.exports = veo3Worker;
