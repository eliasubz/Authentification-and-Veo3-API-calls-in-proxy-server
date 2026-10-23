const { Worker } = require('bullmq');
const Pet = require('../models/Pet');
const User = require('../models/User');
const { trainLora } = require('../services/runpodApi');
const { toWorkerInput } = require('../services/storage');
const { redis } = require('../config');

// Only forward the knobs the training worker understands (production defaults live in the worker).
const CONFIG_KEYS = ['resolution', 'batch_size', 'learning_rate', 'rank', 'images_seen', 'seed'];

const trainWorker = new Worker(
    'train',
    async (job) => {
        const pet = await Pet.findByIdAndUpdate(job.data.petId, { status: 'training' }, { new: true });
        if (!pet) throw new Error(`Pet ${job.data.petId} not found`);
        console.log(`Training LoRA for pet ${pet._id} (${pet.photos.length} photos)`);

        const config = job.data.config || {};
        const { lora_url, lora_path, instance_prompt, description, ...metrics } = await trainLora({
            ...Object.fromEntries(CONFIG_KEYS.filter((k) => config[k] !== undefined).map((k) => [k, config[k]])),
            images: await Promise.all(pet.photos.map(toWorkerInput)),
            class_word: pet.species,
            run_id: pet._id.toString(),
        });

        await Pet.findByIdAndUpdate(pet._id, {
            status: 'ready',
            // lora_path only works when generation runs on the same machine (local/Colab testing)
            loraUrl: lora_url || lora_path,
            instancePrompt: instance_prompt,
            description,
            trainMetrics: metrics,
        });
        console.log(`Pet ${pet._id} ready: train ${(metrics.timings_ms?.total / 60000).toFixed(1)} min, end-to-end ${(metrics.endToEndMs / 60000).toFixed(1)} min`);
    },
    // Training takes a whole GPU for minutes; send one job at a time per server worker.
    { connection: redis, concurrency: 1, lockDuration: 60000 }
);

trainWorker.on('failed', async (job, err) => {
    console.error(`Training job ${job?.id} failed:`, err.message);
    if (!job) return;
    // No automatic retries for training: mark failed and refund, the user can start it again.
    await Pet.findByIdAndUpdate(job.data.petId, { status: 'failed', error: err.message, $inc: { creditsUsed: -job.data.cost } });
    await User.findByIdAndUpdate(job.data.userId, { $inc: { credits: job.data.cost } });
});

module.exports = trainWorker;
