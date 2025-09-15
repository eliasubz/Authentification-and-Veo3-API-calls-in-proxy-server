// models/Veo3Job.js
const mongoose = require('mongoose');

const Veo3JobSchema = new mongoose.Schema({
    owner: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    params: { type: Object, required: true },
    status: { type: String, enum: ['queued', 'running', 'completed', 'failed'], default: 'queued' },
    creditsUsed: { type: Number, default: 0 },
    resultUrl: { type: String },    // where generated file is stored (S3)
    error: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Veo3Job', Veo3JobSchema);  