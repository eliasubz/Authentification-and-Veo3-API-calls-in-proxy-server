// models/Veo3Job.js
const mongoose = require('mongoose');

const Veo3JobSchema = new mongoose.Schema({
    owner: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    params: { type: Object, required: true },
    status: { type: String, enum: ['queued', 'running', 'completed', 'failed'], default: 'queued' },
    creditsUsed: { type: Number, default: 0 },
    resultUrl: { type: String },    // where generated file is stored (local /results for now, S3 later)
    metrics: { type: Object },      // seed, timings_ms, delayTimeMs, executionTimeMs, endToEndMs
    error: { type: String },
    startedAt: { type: Date },
    completedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Veo3Job', Veo3JobSchema);
