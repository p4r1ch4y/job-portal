const mongoose = require('mongoose');

const assignmentSubmissionSchema = new mongoose.Schema({
    assignmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assignment',
        required: true
    },
    applicationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Application',
        required: true,
        unique: true
    },
    candidateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    submissionContent: {
        type: String,
        trim: true
    },
    submissionFileUrl: {
        type: String,
        trim: true,
        match: [/^(ftp|http|https):\/\/[^ "]+$/, 'Please provide a valid URL for the submission file']
    },
    submittedDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['Submitted', 'Under Review', 'Graded', 'Needs Revision'],
        default: 'Submitted'
    },
    grade: {
        type: String,
        trim: true
    },
    feedback: {
        type: String,
        trim: true
    },
    gradedDate: {
        type: Date
    },
    gradedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

assignmentSubmissionSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

assignmentSubmissionSchema.index({ assignmentId: 1 });
assignmentSubmissionSchema.index({ applicationId: 1 });
assignmentSubmissionSchema.index({ candidateId: 1 });
assignmentSubmissionSchema.index({ jobId: 1 });
assignmentSubmissionSchema.index({ status: 1 });

module.exports = mongoose.model('AssignmentSubmission', assignmentSubmissionSchema);
