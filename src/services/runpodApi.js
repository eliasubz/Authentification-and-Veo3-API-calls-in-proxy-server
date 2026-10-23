// services/runpodApi.js
// Calls the RunPod serverless workers (see Stable_Diffusion_on_RunPod/worker):
// the generation endpoint (handler.py) and the training endpoint (train.py).
const axios = require('axios');
const { runpod } = require('../config');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function client(endpoint) {
    if (!endpoint.baseUrl && (!endpoint.endpointId || !runpod.apiKey)) {
        throw new Error('RunPod endpoint ID / RUNPOD_API_KEY not set');
    }
    return axios.create({
        // baseUrl points at a local/Colab `--rp_serve_api` server for testing
        baseURL: endpoint.baseUrl || `https://api.runpod.ai/v2/${endpoint.endpointId}`,
        headers: { Authorization: `Bearer ${runpod.apiKey}` },
        timeout: 30000,
    });
}

// Submit async, then poll /status so long or cold-start jobs don't hit HTTP timeouts.
async function runJob(endpoint, input) {
    const api = client(endpoint);
    const submittedAt = Date.now();
    const { data: run } = await api.post('/run', { input });

    while (Date.now() - submittedAt < endpoint.timeoutMs) {
        await sleep(runpod.pollMs);
        // The runpod SDK's local test server (--rp_serve_api) only accepts POST here
        const { data } = endpoint.baseUrl ? await api.post(`/status/${run.id}`) : await api.get(`/status/${run.id}`);

        if (data.status === 'COMPLETED') {
            if (data.output?.error) throw new Error(`${data.output.error} ${data.output.log_tail || ''}`.trim());
            return {
                ...data.output,
                runpodJobId: run.id,
                // delayTime = queue + cold start on RunPod, executionTime = handler time
                delayTimeMs: data.delayTime,
                executionTimeMs: data.executionTime,
                endToEndMs: Date.now() - submittedAt,
            };
        }
        if (['FAILED', 'CANCELLED', 'TIMED_OUT'].includes(data.status)) {
            throw new Error(`RunPod job ${run.id} ${data.status}: ${JSON.stringify(data.error || data.output)}`);
        }
    }

    await api.post(`/cancel/${run.id}`).catch(() => {});
    throw new Error(`RunPod job ${run.id} timed out after ${endpoint.timeoutMs}ms`);
}

// 1x1 grey PNG
const FAKE_PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

exports.generateImage = async (input) => {
    if (runpod.fake) {
        await sleep(1000);
        return { image_base64: FAKE_PNG, seed: 0, fake: true, timings_ms: { inference: 0 }, endToEndMs: 1000 };
    }
    return runJob(runpod.generate, input);
};

exports.trainLora = async (input) => {
    if (runpod.fake) {
        await sleep(2000);
        return {
            lora_url: `fake://loras/${input.run_id}.safetensors`,
            instance_prompt: `a photo of sks ${input.class_word}`,
            description: `British Shorthair, gray, short, yellow`,
            fake: true,
            timings_ms: { total: 2000 },
            endToEndMs: 2000,
        };
    }
    return runJob(runpod.train, input);
};
