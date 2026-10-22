// services/queueService.js
const { Queue } = require('bullmq');
const { redis } = require('../config');

const veo3Queue = new Queue('veo3', { connection: redis });

async function enqueue(queueName, data) {
    const queue = queueName === 'veo3' ? veo3Queue : null;
    if (!queue) throw new Error(`Queue ${queueName} not found`);
    // RunPod already retries on its side; one retry here covers transient network errors.
    const job = await queue.add('task', data, { attempts: 2, backoff: { type: 'exponential', delay: 5000 }, removeOnComplete: true });
    return job;
}

module.exports = {
    enqueue,
    veo3Queue,
};
