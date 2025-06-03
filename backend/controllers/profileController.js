const Profile = require('../models/Profile');
const User = require('../models/User');
const getCurrentCandidateProfile = async (req, res) => {
    try {
        const profile = await Profile.findOne({ candidateId: req.user._id }).populate('candidateId', 'name email');
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found for this candidate.' });
        }
        res.json(profile);
    } catch (error) {
        console.error('Get current profile error:', error.message);
        res.status(500).json({ message: 'Server Error fetching profile.' });
    }
};


const createOrUpdateProfile = async (req, res) => {
    const {
        headline, summary, skills, experience, education, resumeUrl, contact, isVisible
    } = req.body;

    const profileFields = {};
    profileFields.candidateId = req.user._id;
    if (headline !== undefined) profileFields.headline = headline;
    if (summary !== undefined) profileFields.summary = summary;
    if (skills !== undefined) {
        profileFields.skills = Array.isArray(skills) ? skills.map(s => s.trim().toLowerCase()) : skills.split(',').map(s => s.trim().toLowerCase());
    }
    if (experience !== undefined) profileFields.experience = experience;
    if (education !== undefined) profileFields.education = education;
    if (resumeUrl !== undefined) profileFields.resumeUrl = resumeUrl;
    if (contact !== undefined) profileFields.contact = contact;
    if (isVisible !== undefined) profileFields.isVisible = isVisible;

    try {
        let profile = await Profile.findOne({ candidateId: req.user._id });

        if (profile) {
            // Update existing profile
            profile = await Profile.findOneAndUpdate(
                { candidateId: req.user._id },
                { $set: profileFields },
                { new: true, runValidators: true }
            ).populate('candidateId', 'name email');
            return res.json(profile);
        } else {
            // Create new profile
            profile = new Profile(profileFields);
            await profile.save();
            const populatedProfile = await Profile.findById(profile._id).populate('candidateId', 'name email');
            return res.status(201).json(populatedProfile);
        }
    } catch (error) {
        console.error('Create/Update profile error:', error.message);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: "Validation Error", errors: messages });
        }
        res.status(500).json({ message: 'Server Error saving profile.' });
    }
};

const getAllProfiles = async (req, res) => {
    const pageSize = parseInt(req.query.pageSize) || 10;
    const page = parseInt(req.query.page) || 1;
    const sort = req.query.sort || '-updatedAt';

    let queryFilter = { isVisible: true };

    if (req.query.keyword) {
        queryFilter.$text = { $search: req.query.keyword };
    }
    if (req.query.skills) {
        const skillsArray = req.query.skills.split(',').map(skill => skill.trim().toLowerCase());
        queryFilter.skills = { $all: skillsArray };
    }

    try {
        const count = await Profile.countDocuments(queryFilter);
        const profiles = await Profile.find(queryFilter)
            .populate('candidateId', 'name email')
            .limit(pageSize)
            .skip(pageSize * (page - 1))
            .sort(sort);

        res.json({
            profiles,
            page,
            pages: Math.ceil(count / pageSize),
            count
        });
    } catch (error) {
        console.error('Get all profiles error:', error.message);
        res.status(500).json({ message: 'Server Error fetching profiles.' });
    }
};


const getProfileByUserId = async (req, res) => {
    try {
        const profile = await Profile.findOne({ candidateId: req.params.userId, isVisible: true })
                                   .populate('candidateId', 'name email createdAt');
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found or not visible.' });
        }
        res.json(profile);
    } catch (error) {
        console.error('Get profile by user ID error:', error.message);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Profile not found (invalid user ID format).' });
        }
        res.status(500).json({ message: 'Server Error fetching profile.' });
    }
};


const deleteProfile = async (req, res) => {
    try {
        const profile = await Profile.findOneAndRemove({ candidateId: req.user._id });

        if (!profile) {
            return res.status(404).json({ message: 'Profile not found to delete.' });
        }


        res.json({ message: 'Profile deleted successfully.' });
    } catch (error) {
        console.error('Delete profile error:', error.message);
        res.status(500).json({ message: 'Server Error deleting profile.' });
    }
};

module.exports = {
    getCurrentCandidateProfile,
    createOrUpdateProfile,
    getAllProfiles,
    getProfileByUserId,
    deleteProfile
};
