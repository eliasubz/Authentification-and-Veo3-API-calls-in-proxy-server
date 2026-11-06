const authService = require('../services/authService');

exports.register = async (req, res) => {
    try {
        const user = await authService.register(req.body);
        res.status(201).json({ message: 'User registered successfully', user });
    } catch (err) {
        const code = err.code === 11000 ? 409 : 500; // duplicate username or email
        res.status(code).json({ message: code === 409 ? 'Username or email already taken' : err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const token = await authService.login(req.body);
        res.status(200).json({ token, message: 'Logged in successfully' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
