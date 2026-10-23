// models/Pet.js
const mongoose = require('mongoose');

const PetSchema = new mongoose.Schema({
    owner: { type: mongoose.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true },
    species: { type: String, enum: ['cat', 'dog', 'pet'], default: 'pet' },
    photos: { type: [String], default: [] },   // storage URLs (R2) or local paths
    // new -> queued -> training -> ready | failed
    status: { type: String, enum: ['new', 'queued', 'training', 'ready', 'failed'], default: 'new' },
    loraUrl: { type: String },
    instancePrompt: { type: String },           // e.g. "a photo of sks cat"
    description: { type: String },              // auto description from the training worker, e.g. "British Shorthair, gray, ..."
    trainMetrics: { type: Object },             // timings_ms, size_mb, delayTimeMs, executionTimeMs, endToEndMs
    creditsUsed: { type: Number, default: 0 },
    error: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Pet', PetSchema);
