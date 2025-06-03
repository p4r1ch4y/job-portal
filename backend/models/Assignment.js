const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    employerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Please provide an assignment title'],
        trim: true,
        maxlength: [150, 'Assignment title cannot exceed 150 characters']
    },
    description: {
        type: String,
        required: [true, 'Please provide an assignment description'],
        maxlength: [5000, 'Assignment description cannot exceed 5000 characters']
    },
    templateFileUrl: {
        type: String,
        trim: true,
        match: [/^(ftp|http|https):\/\/[^ "]+$/, 'Please provide a valid URL for the template file']
    },
    timeToComplete: {
        type: String, 
        trim: true
    },
    dueDate: {
        type: Date
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

assignmentSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

assignmentSchema.index({ jobId: 1 });
assignmentSchema.index({ employerId: 1 });
assignmentSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Assignment', assignmentSchema);
