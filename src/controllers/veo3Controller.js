// controllers/veo3Controller.js
const veo3Service = require('../services/veo3Service');
const User = require('../models/User');

exports.generate = async (req, res) => {
    try {
        const userId = req.user.id;

        // Check user credits
        console.log(req.user.credits);
        const user = req.user;
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.credits <= 0) {
            return res.status(403).json({ message: 'Not enough credits' });
        }

        // Call Veo3 service
        const result = await veo3Service.createVeo3Job(user.id, req.body, 1);

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

exports.buyCredits = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found in veo3Controller.buyCredits' });
        user.credits += 5;
        await req.user.save();
        res.status(200).json({ message: `You bought 5 credits and have now a total of ${req.user.credits}`, user: req.user });
    } catch (err) {
        res.status(500).json({ message: `Error buying Credits`, error: err.message });

    }
}
