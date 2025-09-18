// services/veo3Service.js
const mongoose = require('mongoose');
const User = require('../models/User');
const Veo3Job = require('../models/Veo3Job');
// const queue = require('./queueService'); // wrapper for SQS/Bull

async function createVeo3Job(userId, body, cost) {
    cost = 1
    const session = await mongoose.startSession();
    console.log('Veo3Service was used!!!');
    session.startTransaction();
    try {
        const user = await User.findById(userId).session(session);
        if (!user) throw new Error('User not found');
        if (user.credits < cost) {
            throw new Error('Insufficient credits');
        }
        // reserve credits
        user.credits -= cost;
        await user.save({ session });

        // create job
        const job = await Veo3Job.create([{
            owner: user._id,
            params: body,
            creditsUsed: cost,
            status: 'queued'
        }], { session });

        // commit transaction before enqueueing
        await session.commitTransaction();
        session.endSession();

        // enqueue job (outside transaction)
        await queue.enqueue('veo3', { jobId: job[0]._id.toString(), userId: user._id, params: body });
        return job[0];
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        throw err;
    }
    services / veo3Service.js
    const axios = require('axios');

    exports.generateSomething = async (payload) => {
        // Example API call
        const response = await axios.post('https://api.veo3.com/generate', payload, {
            headers: {
                Authorization: `Bearer ${process.env.VEO3_API_KEY}`,
                'Content-Type': 'application/json',
            },
        });

        return response.data;
    };
}

module.exports = { createVeo3Job };
