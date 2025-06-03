const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const Profile = require('../models/Profile'); // For profile snapshot

const applyForJob = async (req, res) => {
    const { jobId } = req.params;
    const candidateId = req.user._id;
    const { coverLetter } = req.body;

    try {
        const job = await Job.findById(jobId);
        if (!job || !job.isActive) {
            return res.status(404).json({ message: 'Job not found or no longer active.' });
        }

        const existingApplication = await Application.findOne({ jobId, candidateId });
        if (existingApplication) {
            return res.status(400).json({ message: 'You have already applied for this job.' });
        }

        const candidateProfile = await Profile.findOne({ candidateId }).select('skills headline resumeUrl');
        const user = await User.findById(candidateId).select('name email');

        const profileSnapshot = {
            name: user ? user.name : 'N/A',
            email: user ? user.email : 'N/A',
            skills: candidateProfile ? candidateProfile.skills : [],
            headline: candidateProfile ? candidateProfile.headline : '',
            resumeUrl: candidateProfile ? candidateProfile.resumeUrl : ''
        };

        const application = new Application({
            jobId,
            candidateId,
            employerId: job.employerId,
            coverLetter,
            profileSnapshot
        });

        const savedApplication = await application.save();

        job.applicationsCount = (job.applicationsCount || 0) + 1;
        await job.save();

        res.status(201).json(savedApplication);
    } catch (error) {
        console.error('Apply for job error:', error.message);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: "Validation Error", errors: messages });
        }
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Invalid Job ID format.' });
        }
        res.status(500).json({ message: 'Server Error processing application.' });
    }
};

const getApplicationsForJob = async (req, res) => {
    const { jobId } = req.params;
    const employerId = req.user._id;

    try {
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found.' });
        }
        if (job.employerId.toString() !== employerId.toString()) {
            return res.status(403).json({ message: 'Not authorized to view applications for this job.' });
        }

        const applications = await Application.find({ jobId })
            .populate('candidateId', 'name email')
            .populate('jobId', 'title companyName')
            .sort({ applicationDate: -1 });

        res.json(applications);
    } catch (error) {
        console.error('Get applications for job error:', error.message);
        res.status(500).json({ message: 'Server Error fetching applications.' });
    }
};


const getApplicationsByCandidate = async (req, res) => {
    try {
        const applications = await Application.find({ candidateId: req.user._id })
            .populate('jobId', 'title companyName location jobType applicationDeadline')
            .sort({ applicationDate: -1 });
        res.json(applications);
    } catch (error) {
        console.error('Get applications by candidate error:', error.message);
        res.status(500).json({ message: 'Server Error fetching your applications.' });
    }
};


const getApplicationDetails = async (req, res) => {
    try {
        const application = await Application.findById(req.params.applicationId)
            .populate('jobId', 'title companyName employerId')
            .populate('candidateId', 'name email')
            .populate('employerId', 'name email companyName');

        if (!application) {
            return res.status(404).json({ message: 'Application not found.' });
        }

        const isCandidate = application.candidateId._id.toString() === req.user._id.toString();
        const isEmployer = application.employerId._id.toString() === req.user._id.toString();

        if (!isCandidate && !isEmployer) {
            return res.status(403).json({ message: 'Not authorized to view this application.' });
        }

        res.json(application);
    } catch (error) {
        console.error('Get application details error:', error.message);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Application not found (invalid ID format).' });
        }
        res.status(500).json({ message: 'Server Error fetching application details.' });
    }
};

const updateApplicationStatus = async (req, res) => {
    const { status } = req.body;
    const { applicationId } = req.params;

    if (!status || !Application.schema.path('status').enumValues.includes(status)) {
        return res.status(400).json({ message: 'Invalid application status provided.' });
    }

    try {
        const application = await Application.findById(applicationId);
        if (!application) {
            return res.status(404).json({ message: 'Application not found.' });
        }

        if (application.employerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this application status.' });
        }

        application.status = status;
        application.updatedAt = Date.now();
        const updatedApplication = await application.save();

        res.json(updatedApplication);
    } catch (error) {
        console.error('Update application status error:', error.message);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: "Validation Error", errors: messages });
        }
        res.status(500).json({ message: 'Server Error updating application status.' });
    }
};


const withdrawApplication = async (req, res) => {
    const { applicationId } = req.params;

    try {
        const application = await Application.findById(applicationId);
        if (!application) {
            return res.status(404).json({ message: 'Application not found.' });
        }

        if (application.candidateId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to withdraw this application.' });
        }

        if (application.status === 'Withdrawn') {
            return res.status(400).json({ message: 'Application already withdrawn.' });
        }
        application.status = 'Withdrawn';
        application.updatedAt = Date.now();
        await application.save();

        const job = await Job.findById(application.jobId);
        if (job) {
            job.applicationsCount = Math.max(0, (job.applicationsCount || 0) - 1);
            await job.save();
        }

        res.json({ message: 'Application withdrawn successfully.', application });

    } catch (error) {
        console.error('Withdraw application error:', error.message);
        res.status(500).json({ message: 'Server Error withdrawing application.' });
    }
};

module.exports = {
    applyForJob,
    getApplicationsForJob,
    getApplicationsByCandidate,
    getApplicationDetails,
    updateApplicationStatus,
    withdrawApplication
};
