const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide experience title'],
        trim: true
    },
    company: {
        type: String,
        required: [true, 'Please provide company name for experience'],
        trim: true
    },
    location: {
        type: String,
        trim: true
    },
    startDate: {
        type: Date,
        required: [true, 'Please provide start date for experience']
    },
    endDate: {
        type: Date
    },
    description: {
        type: String,
        trim: true,
        maxlength: [1000, 'Experience description cannot exceed 1000 characters']
    }
}, { _id: false });

const educationSchema = new mongoose.Schema({
    institution: {
        type: String,
        required: [true, 'Please provide institution name'],
        trim: true
    },
    degree: {
        type: String,
        required: [true, 'Please provide degree'],
        trim: true
    },
    fieldOfStudy: {
        type: String,
        trim: true
    },
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    },
    grade: {
        type: String,
        trim: true
    }
}, { _id: false });

const profileSchema = new mongoose.Schema({
    candidateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    headline: {
        type: String,
        trim: true,
        maxlength: [150, 'Headline cannot exceed 150 characters']
    },
    summary: {
        type: String,
        trim: true,
        maxlength: [2000, 'Summary cannot exceed 2000 characters']
    },
    skills: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    experience: [experienceSchema],
    education: [educationSchema],
    resumeUrl: {
        type: String,
        trim: true,

        match: [/^(ftp|http|https):\/\/[^ "]+$/, 'Please provide a valid URL for the resume']
    },
    contact: {
        phone: {
            type: String,
            trim: true
        },
        linkedin: {
            type: String,
            trim: true,
            match: [/^(https|http):\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?$/,
                    'Please provide a valid LinkedIn profile URL']
        },
        github: {
            type: String,
            trim: true,
            match: [/^(https|http):\/\/(www\.)?github\.com\/[a-zA-Z0-9_-]+\/?$/,
                    'Please provide a valid GitHub profile URL']
        },
        portfolio: {
            type: String,
            trim: true,
            match: [/^(ftp|http|https):\/\/[^ "]+$/, 'Please provide a valid portfolio URL']
        }
    },
    isVisible: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

profileSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

profileSchema.index({ candidateId: 1 });
profileSchema.index({ skills: 1 });
profileSchema.index({ headline: 'text', summary: 'text', 'experience.title': 'text', 'experience.company': 'text' });

module.exports = mongoose.model('Profile', profileSchema);
