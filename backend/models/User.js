const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true
    },
    email: {
        type: String,
        required: function () {
            return this.role === 'teacher';
        },
        unique: true,
        sparse: true,
        lowercase: true,
        trim: true
    },
    studentId: {
        type: String,
        unique: true,
        sparse: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 6,
        select: false
    },
    role: {
        type: String,
        enum: ['student', 'teacher'],
        required: true
    },
    // Student-specific fields
    class: {
        type: String,
    },
    section: {
        type: String,
    },
    rollNumber: {
        type: String,
        required: function () {
            return this.role === 'student';
        },
        unique: true,
        sparse: true
    },
    dateOfBirth: {
        type: Date,
        required: function () {
            return this.role === 'student';
        }
    },
    profilePicture: {
        type: String,
        default: ''
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    isRejected: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
