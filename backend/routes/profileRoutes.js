const express = require('express');
const router = express.Router();
const {
    createOrUpdateProfile,
    getCurrentCandidateProfile,
    getProfileByUserId, // For employers or public view if allowed
    getAllProfiles, // For admin or employer search (with filters)
    deleteProfile // Candidate deletes their own profile
} = require('../controllers/profileController');
const { protect, authorize, candidate } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('candidate'), createOrUpdateProfile); // or protect, candidate

router.get('/me', protect, authorize('candidate'), getCurrentCandidateProfile);

router.get('/user/:userId', protect, getProfileByUserId); 

router.get('/', protect, authorize('employer'), getAllProfiles);

router.delete('/', protect, authorize('candidate'), deleteProfile);

module.exports = router;
