// services/veo3Service.js
const mongoose = require('mongoose');
const User = require('../models/User');
const Veo3Job = require('../models/Veo3Job');
const queue = require('./queueService'); // wrapper for SQS/Bull

async function createVeo3Job(userId, params, cost) {
    const session = await mongoose.startSession();
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
            params,
            creditsUsed: cost,
            status: 'queued'
        }], { session });

        // commit transaction before enqueueing
        await session.commitTransaction();
        session.endSession();

        // enqueue job (outside transaction)
        await queue.enqueue('veo3', { jobId: job[0]._id.toString(), userId: user._id, params });
        return job[0];
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        throw err;
    }
}

module.exports = { createVeo3Job };
