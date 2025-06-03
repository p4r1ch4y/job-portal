const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    candidateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    employerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['Applied', 'Viewed', 'Shortlisted', 'Interviewing', 'Offered', 'Rejected', 'Withdrawn'],
        default: 'Applied'
    },
    applicationDate: {
        type: Date,
        default: Date.now
    },
    coverLetter: {
        type: String,
        trim: true,
        maxlength: [5000, 'Cover letter cannot exceed 5000 characters']
    },
    profileSnapshot: {
        name: String,
        email: String,
        skills: [String],
        headline: String,
        resumeUrl: String
    },
    notes: [{
        byUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        note: String,
        date: { type: Date, default: Date.now }
    }],
    assignmentSubmission: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AssignmentSubmission',
        default: null
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

applicationSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

applicationSchema.index({ jobId: 1, candidateId: 1 }, { unique: true });

applicationSchema.index({ jobId: 1 });
applicationSchema.index({ candidateId: 1 });
applicationSchema.index({ employerId: 1 });
applicationSchema.index({ status: 1 });
applicationSchema.index({ applicationDate: -1 });

module.exports = mongoose.model('Application', applicationSchema);
