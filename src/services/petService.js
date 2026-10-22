// services/petService.js
const mongoose = require('mongoose');
const Pet = require('../models/Pet');
const User = require('../models/User');
const queue = require('./queueService');
const storage = require('./storage');
const { trainCost } = require('../config');

const MIN_PHOTOS = 3;
const MAX_PHOTOS = 10;

function decodePhoto(b64) {
    const buffer = Buffer.from(b64.split(',', 2).pop(), 'base64'); // tolerate data: URIs
    const isPng = buffer.subarray(0, 4).toString('hex') === '89504e47';
    return { buffer, ext: isPng ? 'png' : 'jpg', contentType: isPng ? 'image/png' : 'image/jpeg' };
}

async function createPet(userId, { name, species, photos }) {
    if (!Array.isArray(photos) || photos.length < MIN_PHOTOS || photos.length > MAX_PHOTOS) {
        throw new Error(`Send between ${MIN_PHOTOS} and ${MAX_PHOTOS} photos`);
    }
    const pet = new Pet({ owner: userId, name, species });
    pet.photos = await Promise.all(photos.map((b64, i) => {
        const { buffer, ext, contentType } = decodePhoto(b64);
        return storage.save(`pets/${pet._id}/${i}.${ext}`, buffer, contentType);
    }));
    return pet.save();
}

// Reserves credits and enqueues training in one transaction, like createVeo3Job
async function startTraining(userId, petId, config = {}) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const pet = await Pet.findOne({ _id: petId, owner: userId }).session(session);
        if (!pet) throw new Error('Pet not found');
        if (!['new', 'failed'].includes(pet.status)) throw new Error(`Pet is already ${pet.status}`);

        const user = await User.findById(userId).session(session);
        if (user.credits < trainCost) throw new Error('Insufficient credits');
        user.credits -= trainCost;
        await user.save({ session });

        pet.status = 'queued';
        pet.error = undefined;
        pet.creditsUsed += trainCost;
        await pet.save({ session });

        await session.commitTransaction();
        session.endSession();

        await queue.enqueue('train', { petId: pet._id.toString(), userId, cost: trainCost, config });
        return pet;
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        throw err;
    }
}

module.exports = { createPet, startTraining };
