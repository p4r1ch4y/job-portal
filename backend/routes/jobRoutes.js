const express = require('express');
const router = express.Router();
const {
    createJob,
    getJobs,
    getJobById,
    updateJob,
    deleteJob,
    getEmployerJobs,
    getJobsBySkills, // Example of a more specific search route
    incrementJobView // Example for tracking views
} = require('../controllers/jobController');
const { protect, authorize, employer } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('employer'), createJob); // or protect, employer

router.get('/', getJobs);

router.get('/employer', protect, authorize('employer'), getEmployerJobs);

router.get('/skills', getJobsBySkills); // Example, might be part of general getJobs with query params

router.get('/:id', getJobById);

router.put('/:id/view', incrementJobView); 

router.put('/:id', protect, authorize('employer'), updateJob);

router.delete('/:id', protect, authorize('employer'), deleteJob);

module.exports = router;
