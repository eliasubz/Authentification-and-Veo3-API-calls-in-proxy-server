// controllers/veo3Controller.js
const veo3Service = require('../services/veo3Service');
const User = require('../models/User');

exports.generate = async (req, res) => {
    try {
        console.log("Before asking for id")
        const userId = req.user.id;
        console.log("After asking for id", userId)

        // Check user credits
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.credits <= 0) {
            return res.status(403).json({ message: 'Not enough credits' });
        }

        // Call Veo3 service
        const result = await veo3Service.generateSomething(req.body);

        // Deduct credit
        user.credits -= 1;
        await user.save();

        res.status(200).json({ message: 'Veo3 generation successful', data: result });
    } catch (err) {
        res.status(500).json({ message: 'Error calling Veo3', error: err.message });
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
