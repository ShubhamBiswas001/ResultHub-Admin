const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    examName: {
        type: String,
        required: true
    },
    examDate: {
        type: Date,
        required: true
    },
    pdfPath: {
        type: String,
        default: null
    },
    subjects: [{
        name: { type: String },
        marksObtained: { type: Number },
        totalMarks: { type: Number },
        grade: { type: String }
    }],
    totalMarks: {
        type: Number,
        default: 0
    },
    percentage: {
        type: String,
        default: '0'
    },
    overallGrade: {
        type: String,
        default: 'N/A'
    },
    remarks: {
        type: String
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
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

// Update the updatedAt field before saving
resultSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Result', resultSchema);
