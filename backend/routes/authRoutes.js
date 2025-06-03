const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    getMe,
    logoutUser, //JWT logout is client-side or via token blocklist
    updatePassword,
    forgotPassword,
    resetPassword
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);

router.post('/login', loginUser);

router.get('/me', protect, getMe);


router.post('/logout', protect, logoutUser);

router.put('/updatepassword', protect, updatePassword);

router.post('/forgotpassword', forgotPassword);

router.put('/resetpassword/:resettoken', resetPassword);

module.exports = router;
