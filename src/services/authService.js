const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config');
const User = require('../models/User');

exports.register = async ({ username, email, password }) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    let role = username === 'Joao' ? 'admin' : 'user';
    const user = new User({ username, email, password: hashedPassword, role });
    return user.save();
};

exports.login = async ({ email, password }) => {
    const user = await User.findOne({ email });
    if (!user) throw new Error('Email not found');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Invalid credentials');

    return jwt.sign({ id: user._id, role: user.role }, jwtSecret, { expiresIn: '200h' });
};
