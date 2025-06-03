const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            next();
        } catch (error) {
            console.error('Token verification failed:', error.message);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token provided' });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: `User role ${req.user ? req.user.role : 'unknown'} is not authorized to access this route` });
        }
        next();
    };
};

const employer = (req, res, next) => {
    if (req.user && req.user.role === 'employer') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as an employer' });
    }
};

const candidate = (req, res, next) => {
    if (req.user && req.user.role === 'candidate') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as a candidate' });
    }
};

module.exports = { protect, authorize, employer, candidate };
