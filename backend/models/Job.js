const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    employerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Please provide a job title'],
        trim: true,
        maxlength: [100, 'Job title cannot be more than 100 characters']
    },
    companyName: {
        type: String,
        required: [true, 'Please provide the company name']
    },
    location: {
        type: String,
        required: [true, 'Please provide a location'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please provide a job description'],
        maxlength: [2000, 'Job description cannot be more than 2000 characters']
    },
    requirements: [{
        type: String,
        trim: true
    }],
    skills: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    salaryMin: {
        type: Number,
        min: [0, 'Minimum salary cannot be negative']
    },
    salaryMax: {
        type: Number,
        validate: {
            validator: function(value) {
                return !this.salaryMin || !value || value >= this.salaryMin;
            },
            message: 'Maximum salary must be greater than or equal to minimum salary'
        }
    },
    jobType: {
        type: String,
        enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Temporary'],
        required: [true, 'Please specify the job type']
    },
    postedDate: {
        type: Date,
        default: Date.now
    },
    applicationDeadline: {
        type: Date,
        validate: {
            validator: function(value) {
                return !value || value > Date.now();
            },
            message: 'Application deadline must be a future date'
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    views: {
        type: Number,
        default: 0
    },
    applicationsCount: {
        type: Number,
        default: 0
    },
    hasAssignment: {
        type: Boolean,
        default: false
    },
    assignmentTemplate: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assignment',
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    // External job integration fields
    isExternal: {
        type: Boolean,
        default: false
    },
    external_id: {
        type: String,
        sparse: true
    },
    source: {
        type: String,
        enum: ['internal', 'jsearch', 'adzuna', 'reed', 'indeed'],
        default: 'internal'
    },
    apply_link: {
        type: String
    },
    logo_url: {
        type: String
    },
    company_type: {
        type: String
    }
});

jobSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

jobSchema.index({ title: 'text', companyName: 'text', location: 'text', description: 'text', skills: 'text' });
jobSchema.index({ employerId: 1 });
jobSchema.index({ location: 1 });
jobSchema.index({ skills: 1 });
jobSchema.index({ jobType: 1 });
jobSchema.index({ postedDate: -1 });
jobSchema.index({ isActive: 1, postedDate: -1 });
jobSchema.index({ applicationDeadline: 1 });
jobSchema.index({ external_id: 1, source: 1 });
jobSchema.index({ isExternal: 1 });
jobSchema.index({ source: 1 });

module.exports = mongoose.model('Job', jobSchema);
