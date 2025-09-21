const express = require('express');
const authMiddleware = require('../middlewares/auth');
const roleMiddleware = require('../middlewares/role');

const router = express.Router();

router.get('/user', authMiddleware, (req, res) => {
    res.status(200).json({ message: 'User dashboard', user: req.user });
});

router.get('/admin', [authMiddleware, roleMiddleware('admin')], (req, res) => {
    res.status(200).json({ message: 'Admin dashboard', user: req.user });
});

module.exports = router;
