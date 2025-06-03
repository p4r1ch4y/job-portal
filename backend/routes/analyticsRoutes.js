const express = require('express');
const router = express.Router();
const {
    getJobPostingsAnalytics,
    getApplicationStatusAnalytics,
    getPlatformAnalytics          // Admin: overall platform stats (users, jobs, applications)
} = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/authMiddleware');


router.get('/employer/jobs', protect, authorize('employer'), getJobPostingsAnalytics);


router.get('/employer/applications', protect, authorize('employer'), getApplicationStatusAnalytics);

router.get('/platform', protect, authorize('employer'), getPlatformAnalytics);

module.exports = router;
