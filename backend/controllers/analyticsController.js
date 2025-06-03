const Job = require('../models/Job');
const Application = require('../models/Application');
const User = require('../models/User');


const getJobPostingsAnalytics = async (req, res) => {
    const employerId = req.user._id;
    try {
        const jobs = await Job.find({ employerId });

        let totalViews = 0;
        let totalApplications = 0;
        const jobsAnalytics = jobs.map(job => {
            totalViews += job.views || 0;
            totalApplications += job.applicationsCount || 0;
            return {
                jobId: job._id,
                title: job.title,
                views: job.views || 0,
                applicationsCount: job.applicationsCount || 0,
                isActive: job.isActive,
                postedDate: job.postedDate
            };
        });

        res.json({
            totalJobsPosted: jobs.length,
            totalViews,
            totalApplications,
            averageViewsPerJob: jobs.length > 0 ? (totalViews / jobs.length).toFixed(2) : 0,
            averageApplicationsPerJob: jobs.length > 0 ? (totalApplications / jobs.length).toFixed(2) : 0,
            jobsAnalytics
        });

    } catch (error) {
        console.error('Job postings analytics error:', error.message);
        res.status(500).json({ message: 'Server error fetching job posting analytics.' });
    }
};


const getApplicationStatusAnalytics = async (req, res) => {
    const employerId = req.user._id;
    try {
        const applications = await Application.find({ employerId });

        const statusCounts = {
            Applied: 0,
            Viewed: 0,
            Shortlisted: 0,
            Interviewing: 0,
            Offered: 0,
            Rejected: 0,
            Withdrawn: 0
        };

        applications.forEach(app => {
            if (statusCounts.hasOwnProperty(app.status)) {
                statusCounts[app.status]++;
            }
        });

        res.json({
            totalApplicationsReceived: applications.length,
            statusCounts
        });

    } catch (error) {
        console.error('Application status analytics error:', error.message);
        res.status(500).json({ message: 'Server error fetching application status analytics.' });
    }
};


const getPlatformAnalytics = async (req, res) => {

    // if (req.user.role !== 'admin') {
    //     return res.status(403).json({ message: 'Not authorized for platform analytics.' });
    // }

    try {
        const totalUsers = await User.countDocuments();
        const totalCandidates = await User.countDocuments({ role: 'candidate' });
        const totalEmployers = await User.countDocuments({ role: 'employer' });
        const totalJobs = await Job.countDocuments();
        const totalActiveJobs = await Job.countDocuments({ isActive: true });
        const totalApplications = await Application.countDocuments();


        const topJobsByApplication = await Application.aggregate([
            { $group: { _id: "$jobId", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
            { $lookup: { from: 'jobs', localField: '_id', foreignField: '_id', as: 'jobDetails' } },
            { $unwind: "$jobDetails" },
            { $project: { _id: 0, jobId: "$_id", title: "$jobDetails.title", company: "$jobDetails.companyName", applications: "$count" } }
        ]);

        res.json({
            totalUsers,
            totalCandidates,
            totalEmployers,
            totalJobs,
            totalActiveJobs,
            totalApplications,
            averageApplicationsPerJob: totalJobs > 0 ? (totalApplications / totalJobs).toFixed(2) : 0,
            topJobsByApplication
        });

    } catch (error) {
        console.error('Platform analytics error:', error.message);
        res.status(500).json({ message: 'Server error fetching platform analytics.' });
    }
};

module.exports = {
    getJobPostingsAnalytics,
    getApplicationStatusAnalytics,
    getPlatformAnalytics
};
