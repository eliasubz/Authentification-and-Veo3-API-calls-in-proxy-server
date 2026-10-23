// Enqueuing and DB Creation
const mongoose = require('mongoose');
const User = require('../models/User');
const Veo3Job = require('../models/Veo3Job');
const Pet = require('../models/Pet');
const queue = require('./queueService');

async function createVeo3Job(userId, body, cost = 1) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        if (body.petId) {
            const pet = await Pet.findOne({ _id: body.petId, owner: userId }).select('status').session(session);
            if (!pet) throw new Error('Pet not found');
            // Training takes ~1 min on an L4; generating before that has no LoRA to use
            if (pet.status !== 'ready') throw new Error('Pet is not trained yet');
        }

        const user = await User.findById(userId).session(session);
        if (!user) throw new Error('User not found');
        if (user.credits < cost) throw new Error('Insufficient credits');

        // reserve credits
        user.credits -= cost;
        await user.save({ session });

        // create job record
        const job = await Veo3Job.create([{
            owner: user._id,
            params: body,
            creditsUsed: cost,
            status: 'queued',
        }], { session });

        await session.commitTransaction();
        session.endSession();

        // enqueue job (outside transaction)
        await queue.enqueue('veo3', {
            jobId: job[0]._id.toString(),
            userId: user._id,
            params: body,
        });

        return job[0];
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        throw err;
    }
}

module.exports = { createVeo3Job };
