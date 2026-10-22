// controllers/petController.js
const petService = require('../services/petService');
const Pet = require('../models/Pet');

const STATUS_FOR = {
    'Pet not found': 404,
    'Insufficient credits': 403,
};

exports.create = async (req, res) => {
    try {
        const pet = await petService.createPet(req.user.id, req.body);
        res.status(201).json({ message: 'Pet created', pet });
    } catch (err) {
        const code = err.name === 'ValidationError' || err.message.startsWith('Send between') ? 400 : 500;
        res.status(code).json({ message: 'Error creating pet', error: err.message });
    }
};

exports.list = async (req, res) => {
    try {
        const pets = await Pet.find({ owner: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(pets);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching pets', error: err.message });
    }
};

exports.get = async (req, res) => {
    try {
        const pet = await Pet.findOne({ _id: req.params.id, owner: req.user.id });
        if (!pet) return res.status(404).json({ message: 'Pet not found' });
        res.status(200).json(pet);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching pet', error: err.message });
    }
};

exports.train = async (req, res) => {
    try {
        // Optional overrides for experiments: steps, rank, learning_rate, resolution, prior_preservation
        const pet = await petService.startTraining(req.user.id, req.params.id, req.body?.config);
        res.status(202).json({ message: 'Training queued', petId: pet._id, status: pet.status });
    } catch (err) {
        const code = STATUS_FOR[err.message] || (err.message.startsWith('Pet is already') ? 409 : 500);
        res.status(code).json({ message: 'Error starting training', error: err.message });
    }
};
