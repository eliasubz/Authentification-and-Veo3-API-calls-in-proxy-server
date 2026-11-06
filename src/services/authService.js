const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config');
const User = require('../models/User');

exports.register = async ({ username, email, password }) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    // Admins are promoted directly in the database, never at signup
    const user = new User({ username, email, password: hashedPassword, role: 'user' });
    return user.save();
};

exports.login = async ({ email, password }) => {
    const user = await User.findOne({ email });
    // Same error for unknown email and wrong password, so emails can't be enumerated
    const isMatch = user && (await bcrypt.compare(password, user.password));
    if (!isMatch) throw new Error('Invalid credentials');

    return jwt.sign({ id: user._id, role: user.role }, jwtSecret, { expiresIn: '200h' });
};
