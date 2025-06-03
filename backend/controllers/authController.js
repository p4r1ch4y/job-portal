const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
// const crypto = require('crypto');
// const sendEmail = require('../utils/sendEmail');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '30d',
    });
};

const registerUser = async (req, res, next) => {
    const { name, email, password, role, companyName } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        user = new User({
            name,
            email,
            password,
            role,
            companyName: role === 'employer' ? companyName : undefined,
        });

        await user.save();

        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                companyName: user.companyName
            }
        });

    } catch (error) {
        console.error('Register error:', error.message);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: 'Server error during registration' });
    }
};


const loginUser = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        // Check for user
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials - user not found' });
        }


        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials - password mismatch' });
        }

        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                companyName: user.companyName
            }
        });

    } catch (error) {
        console.error('Login error:', error.message);
        res.status(500).json({ message: 'Server error during login' });
    }
};


const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                companyName: user.companyName,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error('GetMe error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

const logoutUser = (req, res, next) => {

    res.status(200).json({ success: true, message: 'User logged out successfully (client-side action required)' });
};

const updatePassword = async (req, res, next) => {
    const { currentPassword, newPassword } = req.body;

    try {
        const user = await User.findById(req.user.id).select('+password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect current password' });
        }

        user.password = newPassword;
        await user.save();


        res.status(200).json({ success: true, message: 'Password updated successfully' /*, token */ });

    } catch (error) {
        console.error('Update password error:', error.message);
        if (error.name === 'ValidationError') {
             const messages = Object.values(error.errors).map(val => val.message);
             return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: 'Server error updating password' });
    }
};


const forgotPassword = async (req, res, next) => {
    res.status(501).json({ message: 'Forgot password functionality not fully implemented yet. This would typically send a reset email.' });
};

const resetPassword = async (req, res, next) => {
    res.status(501).json({ message: 'Reset password functionality not fully implemented yet. This would validate the token and update the password.' });
};

module.exports = {
    registerUser,
    loginUser,
    getMe,
    logoutUser,
    updatePassword,
    forgotPassword,
    resetPassword
};
