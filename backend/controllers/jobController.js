const Job = require('../models/Job');
const User = require('../models/User');
const Application = require('../models/Application');

const createJob = async (req, res) => {
    try {
        const {
            title, description, location, requirements, skills,
            salaryMin, salaryMax, jobType, applicationDeadline
        } = req.body;

        const employer = await User.findById(req.user._id);
        if (!employer || employer.role !== 'employer') {
            return res.status(403).json({ message: 'User is not an employer.' });
        }

        const job = new Job({
            employerId: req.user._id,
            companyName: employer.companyName,
            title,
            description,
            location,
            requirements: requirements ? (Array.isArray(requirements) ? requirements : requirements.split(',').map(r => r.trim())) : [],
            skills: skills ? (Array.isArray(skills) ? skills.map(s => s.trim().toLowerCase()) : skills.split(',').map(s => s.trim().toLowerCase())) : [],
            salaryMin,
            salaryMax,
            jobType,
            applicationDeadline
        });

        const createdJob = await job.save();
        res.status(201).json(createdJob);
    } catch (error) {
        console.error('Create job error:', error.message);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: "Validation Error", errors: messages });
        }
        res.status(500).json({ message: "Server Error creating job" });
    }
};

const getJobs = async (req, res) => {
    const pageSize = parseInt(req.query.pageSize) || 10;
    const page = parseInt(req.query.page) || 1;
    const sort = req.query.sort || '-postedDate';

    let queryFilter = { isActive: true };

    if (req.query.keyword) {
        queryFilter.$text = { $search: req.query.keyword };
    }
    if (req.query.location) {
        queryFilter.location = { $regex: req.query.location, $options: 'i' };
    }
    if (req.query.jobType) {
        queryFilter.jobType = req.query.jobType;
    }
    if (req.query.skills) {
        const skillsArray = req.query.skills.split(',').map(skill => skill.trim().toLowerCase());
        queryFilter.skills = { $all: skillsArray };
    }

    try {
        const count = await Job.countDocuments(queryFilter);
        const jobs = await Job.find(queryFilter)
            .populate('employerId', 'name companyName')
            .limit(pageSize)
            .skip(pageSize * (page - 1))
            .sort(sort);

        res.json({
            jobs,
            page,
            pages: Math.ceil(count / pageSize),
            count
        });
    } catch (error) {
        console.error('Get jobs error:', error.message);
        res.status(500).json({ message: "Server Error fetching jobs" });
    }
};

const getJobById = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id).populate('employerId', 'name email companyName');
        if (job && job.isActive) {
            res.json(job);
        } else if (job && !job.isActive) {
            res.status(404).json({ message: 'Job not active or found' });
        } else {
            res.status(404).json({ message: 'Job not found' });
        }
    } catch (error) {
        console.error('Get job by ID error:', error.message);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Job not found (invalid ID format)' });
        }
        res.status(500).json({ message: "Server Error fetching job details" });
    }
};

const updateJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        if (job.employerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'User not authorized to update this job' });
        }

        const { title, description, location, requirements, skills, salaryMin, salaryMax, jobType, applicationDeadline, isActive } = req.body;

        if (title) job.title = title;
        if (description) job.description = description;
        if (location) job.location = location;
        if (requirements) job.requirements = Array.isArray(requirements) ? requirements : requirements.split(',').map(r => r.trim());
        if (skills) job.skills = Array.isArray(skills) ? skills.map(s => s.trim().toLowerCase()) : skills.split(',').map(s => s.trim().toLowerCase());
        if (salaryMin !== undefined) job.salaryMin = salaryMin;
        if (salaryMax !== undefined) job.salaryMax = salaryMax;
        if (jobType) job.jobType = jobType;
        if (applicationDeadline) job.applicationDeadline = applicationDeadline;
        if (isActive !== undefined) job.isActive = isActive;

        job.updatedAt = Date.now();
        const updatedJob = await job.save();
        res.json(updatedJob);

    } catch (error) {
        console.error('Update job error:', error.message);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: "Validation Error", errors: messages });
        }
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Job not found (invalid ID format)' });
        }
        res.status(500).json({ message: "Server Error updating job" });
    }
};

const deleteJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        if (job.employerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'User not authorized to delete this job' });
        }

        job.isActive = false;
        job.updatedAt = Date.now();
        await job.save();

        res.json({ message: 'Job removed successfully' });
    } catch (error) {
        console.error('Delete job error:', error.message);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Job not found (invalid ID format)' });
        }
        res.status(500).json({ message: "Server Error deleting job" });
    }
};

const getEmployerJobs = async (req, res) => {
    const pageSize = parseInt(req.query.pageSize) || 10;
    const page = parseInt(req.query.page) || 1;
    const sort = req.query.sort || '-postedDate';
    const filter = req.query.filter;

    let queryFilter = { employerId: req.user._id };

    if (filter === 'active') {
        queryFilter.isActive = true;
    } else if (filter === 'inactive') {
        queryFilter.isActive = false;
    }

    try {
        const count = await Job.countDocuments(queryFilter);
        const jobs = await Job.find(queryFilter)
            .limit(pageSize)
            .skip(pageSize * (page - 1))
            .sort(sort);

        res.json({
            jobs,
            page,
            pages: Math.ceil(count / pageSize),
            count
        });
    } catch (error) {
        console.error('Get employer jobs error:', error.message);
        res.status(500).json({ message: "Server Error fetching employer's jobs" });
    }
};

const getJobsBySkills = async (req, res) => {
    const { skills } = req.query;
    if (!skills) {
        return res.status(400).json({ message: 'Please provide skills to search for.' });
    }
    const skillsArray = skills.split(',').map(skill => skill.trim().toLowerCase());

    try {
        const jobs = await Job.find({ isActive: true, skills: { $all: skillsArray } })
            .populate('employerId', 'name companyName')
            .sort('-postedDate');
        res.json(jobs);
    } catch (error) {
        console.error('Get jobs by skills error:', error.message);
        res.status(500).json({ message: 'Server error fetching jobs by skills.' });
    }
};

const incrementJobView = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (job && job.isActive) {
            job.views = (job.views || 0) + 1;
            await job.save();
            res.json({ message: 'View count incremented', views: job.views });
        } else {
            res.status(404).json({ message: 'Job not found or not active' });
        }
    } catch (error) {
        console.error('Increment job view error:', error.message);
        res.status(500).json({ message: 'Server error incrementing job view' });
    }
};

module.exports = {
    createJob,
    getJobs,
    getJobById,
    updateJob,
    deleteJob,
    getEmployerJobs,
    getJobsBySkills,
    incrementJobView
};
