const { Worker } = require('bullmq');
const mongoose = require('mongoose');
const Veo3Job = require('../models/Veo3Job');
const User = require('../models/User');
const Pet = require('../models/Pet');
const { generateImage } = require('../services/runpodApi');
const storage = require('../services/storage');
const { mongoUri, redis } = require('../config');

mongoose.connect(mongoUri)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection failed:', err));

// Only forward the fields the GPU worker understands.
const INPUT_KEYS = ['prompt', 'lora_scale', 'steps', 'width', 'height', 'seed'];

// Personalize with the pet's LoRA and its auto description (run 4-5: the description removes identity
// failures, the LoRA makes it the individual pet). "{pet}" in the prompt becomes
// "sks cat, British Shorthair, gray, ..."; without it the subject is prepended.
async function applyPet(input, petId) {
    const pet = await Pet.findById(petId);
    if (!pet) throw new Error(`Pet ${petId} not found`);
    if (pet.status !== 'ready') throw new Error(`Pet ${petId} is not trained yet`);

    input.lora = pet.loraUrl;
    const token = pet.instancePrompt.replace(/^a photo of /, '');
    const subject = pet.description ? `${token}, ${pet.description},` : token;
    input.prompt = input.prompt.includes('{pet}') ? input.prompt.replaceAll('{pet}', subject) : `${subject} ${input.prompt}`;
    return 'lora';
}

const veo3Worker = new Worker(
    'veo3',
    async (job) => {
        console.log(`Processing job ${job.id} for user ${job.data.userId}`);

        await Veo3Job.findByIdAndUpdate(job.data.jobId, { status: 'running', startedAt: new Date() });

        const { params } = job.data;
        const input = Object.fromEntries(INPUT_KEYS.filter((k) => params[k] !== undefined).map((k) => [k, params[k]]));
        const method = params.petId ? await applyPet(input, params.petId) : 'text';

        const { image_base64, ...metrics } = await generateImage(input);
        const resultUrl = await storage.save(`results/${job.data.jobId}.png`, Buffer.from(image_base64, 'base64'), 'image/png');

        await Veo3Job.findByIdAndUpdate(job.data.jobId, {
            status: 'completed',
            resultUrl,
            metrics: { ...metrics, method, prompt: input.prompt },
            completedAt: new Date(),
        });

        console.log(`Job ${job.id} completed (${method}): inference ${metrics.timings_ms?.inference?.toFixed(0)}ms, end-to-end ${metrics.endToEndMs}ms`);
        return { resultUrl };
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
