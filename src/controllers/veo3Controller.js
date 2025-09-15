// controllers/veo3Controller.js
const veo3Service = require('../services/veo3Service');

exports.requestGeneration = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const params = req.body;
        const cost = computeCost(params); // implement your cost logic

        const job = await veo3Service.createVeo3Job(userId, params, cost);
        return res.status(202).json({ jobId: job._id, status: job.status });
    } catch (err) {
        if (err.message === 'Insufficient credits') return res.status(402).json({ error: err.message });
        next(err);
    }
};
