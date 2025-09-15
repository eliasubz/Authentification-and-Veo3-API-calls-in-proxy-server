// routes/veo3.js
const express = require('express');
const veo3Controller = require('../controllers/veo3Controller');
// const authMiddleware = require('../middlewares/auth');

const router = express.Router();

// Example: generate a new Veo3 item (protected route)
// router.post('/veo3/generate', authMiddleware, veo3Controller.generate);
router.post('/veo3/generate', veo3Controller.generate);

// Example: check user credits (protected route)
// router.get('/veo3/credits', authMiddleware, veo3Controller.getCredits);
router.get('/veo3/credits', veo3Controller.getCredits);

module.exports = router;
