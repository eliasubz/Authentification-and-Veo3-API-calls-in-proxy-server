// routes/veo3.js
const express = require('express');
const veo3Controller = require('../controllers/veo3Controller');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

router.post('/veo3/generate', authMiddleware, veo3Controller.generate);
router.get('/veo3/jobs/:id', authMiddleware, veo3Controller.getJob);
router.get('/veo3/credits', authMiddleware, veo3Controller.getCredits);
router.get('/veo3/buy_credit', authMiddleware, veo3Controller.buyCredits);

module.exports = router;
