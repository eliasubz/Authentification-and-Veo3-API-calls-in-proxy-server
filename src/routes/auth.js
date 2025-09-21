const express = require('express');
const { body } = require('express-validator');
const validate = require('../middlewares/validate');
const authController = require('../controllers/authController');

const router = express.Router();

router.post(
    '/register',
    [
        body('email').isEmail(),
        body('password').isLength({ min: 6 }),
    ],
    validate,
    authController.register
);

router.post('/login', authController.login);

module.exports = router;
