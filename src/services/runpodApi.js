// services/runpodApi.js
// Calls the RunPod serverless SDXL worker (see Stable_Diffusion_on_RunPod/worker).
const axios = require('axios');
const { runpod } = require('../config');

const api = axios.create({
    // RUNPOD_BASE_URL points at a local/Colab `--rp_serve_api` server for testing
    baseURL: runpod.baseUrl || `https://api.runpod.ai/v2/${runpod.endpointId}`,
    headers: { Authorization: `Bearer ${runpod.apiKey}` },
    timeout: 30000,
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Submit async, then poll /status so long or cold-start jobs don't hit HTTP timeouts.
exports.generateImage = async (input) => {
    if (!runpod.baseUrl && (!runpod.endpointId || !runpod.apiKey)) throw new Error('RUNPOD_ENDPOINT_ID / RUNPOD_API_KEY not set');

    const submittedAt = Date.now();
    const { data: run } = await api.post('/run', { input });

    while (Date.now() - submittedAt < runpod.timeoutMs) {
        await sleep(runpod.pollMs);
        // The runpod SDK's local test server (--rp_serve_api) only accepts POST here
        const { data } = runpod.baseUrl ? await api.post(`/status/${run.id}`) : await api.get(`/status/${run.id}`);

        if (data.status === 'COMPLETED') {
            if (data.output?.error) throw new Error(data.output.error);
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
    throw new Error(`RunPod job ${run.id} timed out after ${runpod.timeoutMs}ms`);
};
