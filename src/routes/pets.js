// routes/pets.js
const express = require('express');
const { body } = require('express-validator');
const petController = require('../controllers/petController');
const authMiddleware = require('../middlewares/auth');
const validate = require('../middlewares/validate');

const router = express.Router();

router.post(
    '/pets',
    authMiddleware,
    [
        body('name').isString().notEmpty(),
        body('species').optional().isIn(['cat', 'dog', 'pet']),
        body('photos').isArray({ min: 3, max: 10 }),
    ],
    validate,
    petController.create
);
router.get('/pets', authMiddleware, petController.list);
router.get('/pets/:id', authMiddleware, petController.get);
router.post('/pets/:id/train', authMiddleware, petController.train);

module.exports = router;
