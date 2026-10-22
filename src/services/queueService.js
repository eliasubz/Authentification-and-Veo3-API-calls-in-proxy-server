// services/queueService.js
const { Queue } = require('bullmq');
const { redis } = require('../config');

const veo3Queue = new Queue('veo3', { connection: redis });
const trainQueue = new Queue('train', { connection: redis });

const queues = {
    // RunPod already retries on its side; one retry here covers transient network errors.
    veo3: { queue: veo3Queue, opts: { attempts: 2, backoff: { type: 'exponential', delay: 5000 } } },
    // Training is slow and costs GPU time, so failures are not retried automatically.
    train: { queue: trainQueue, opts: { attempts: 1 } },
};

async function enqueue(queueName, data) {
    const entry = queues[queueName];
    if (!entry) throw new Error(`Queue ${queueName} not found`);
    return entry.queue.add('task', data, { ...entry.opts, removeOnComplete: true });
}

module.exports = {
    enqueue,
    veo3Queue,
    trainQueue,
};
