const { Worker } = require('bullmq');
const Veo3Job = require('../models/Veo3Job');
const { generateSomething } = require('../services/veo3Api');
const mongoose = require('mongoose');

require('dotenv').config();

// Connect to Mongoose
mongoose.connect(process.env.mongo_uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection failed:', err));

const connection = {
    host: '127.0.0.1',
    port: 6379,
    maxRetriesPerRequest: null, // required by BullMQ v4
};

const veo3Worker = new Worker(
    'veo3',
    async (job) => {
        console.log(`Processing Veo3 job ${job.id} for user ${job.data.userId}`);

        // mark job as in-progress
        await Veo3Job.findByIdAndUpdate(job.data.jobId, {
            status: 'in-progress',
            startedAt: new Date(),
        });

        // simulate long-running task
        const result = await generateSomething(job.data.params);

        // mark job as completed
        await Veo3Job.findByIdAndUpdate(job.data.jobId, {
            status: 'completed',
            result,
            completedAt: new Date(),
        });

        console.log(`Veo3 job ${job.id} completed!`);
        return result;
    },
    {
        connection,
        // lockDuration: 100,
        // maxTTL: 100, // 30 seconds

    }
);

veo3Worker.on('completed', (job) => {
    console.log(`Job ${job.id} has been completed`);
});

veo3Worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed:`, err.message);
});

module.exports = veo3Worker;
