const express = require('express');
const router = express.Router();
const {
    applyForJob,
    getApplicationsForJob,
    getApplicationsByCandidate,
    getApplicationDetails,
    updateApplicationStatus,
    withdrawApplication
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/job/:jobId', protect, authorize('candidate'), applyForJob);

router.get('/job/:jobId', protect, authorize('employer'), getApplicationsForJob);

router.get('/candidate/me', protect, authorize('candidate'), getApplicationsByCandidate);

router.get('/:applicationId', protect, getApplicationDetails);

router.put('/:applicationId/status', protect, authorize('employer'), updateApplicationStatus);

router.delete('/:applicationId/withdraw', protect, authorize('candidate'), withdrawApplication);

module.exports = router;
