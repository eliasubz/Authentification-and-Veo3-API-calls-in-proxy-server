// controllers/veo3Controller.js
const veo3Service = require('../services/veo3Service');
const User = require('../models/User');
const Veo3Job = require('../models/Veo3Job');

exports.generate = async (req, res) => {
    try {
        if (!req.body?.prompt) return res.status(400).json({ message: 'prompt is required' });

        // Reserves the credit and enqueues the job in one transaction
        const job = await veo3Service.createVeo3Job(req.user.id, req.body, 1);

        res.status(202).json({ message: 'Generation queued', jobId: job._id, status: job.status });
    } catch (err) {
        const code = { 'Insufficient credits': 403, 'Pet not found': 404, 'Pet is not trained yet': 409 }[err.message] || 500;
        res.status(code).json({ message: 'Error queueing generation', error: err.message });
    }
};

exports.getJob = async (req, res) => {
    try {
        const job = await Veo3Job.findOne({ _id: req.params.id, owner: req.user.id }).select('-params.pet_image');
        if (!job) return res.status(404).json({ message: 'Job not found' });
        res.status(200).json(job);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching job', error: err.message });
    }
};

exports.getCredits = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.status(200).json({ credits: user.credits });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching credits', error: err.message });
    }
};

exports.buyCredits = async (req, res) => {
    try {
        // Atomic increment, so concurrent requests can't overwrite each other
        const user = await User.findByIdAndUpdate(req.user.id, { $inc: { credits: 5 } }, { new: true });
        if (!user) return res.status(404).json({ message: 'User not found in veo3Controller.buyCredits' });
        res.status(200).json({ message: `You bought 5 credits and have now a total of ${user.credits}`, user });
    } catch (err) {
        res.status(500).json({ message: `Error buying Credits`, error: err.message });
    }
};
