const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const User = require('../models/User'); // For fetching users
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Admin Login
router.post('/login', async (req, res) => {
    const { userId, password } = req.body;

    try {
        // Find admin
        const admin = await Admin.findOne({ userId });
        if (!admin) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        // Create JWT Token
        const payload = {
            admin: {
                id: admin.id,
                userId: admin.userId,
                role: 'admin'
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'secret',
            (err, token) => {
                if (err) throw err;
                res.json({ token, role: 'admin' });
            }
        );

    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).send('Server Error');
    }
});

// Get all users
router.get('/users', async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        console.error("Error fetching users:", err.message);
        res.status(500).send('Server Error');
    }
});

// Update user
router.put('/users/:id', async (req, res) => {
    const { name, email, role, studentId, rollNumber, class: userClass, section } = req.body;

    // Build user object
    const userFields = {};
    if (name) userFields.name = name;
    if (email) userFields.email = email;
    if (role) userFields.role = role;
    if (studentId) userFields.studentId = studentId;
    if (rollNumber) userFields.rollNumber = rollNumber;
    if (userClass) userFields.class = userClass;
    if (section) userFields.section = section;

    try {
        let user = await User.findById(req.params.id);

        if (!user) return res.status(404).json({ msg: 'User not found' });

        user = await User.findByIdAndUpdate(
            req.params.id,
            { $set: userFields },
            { new: true }
        );

        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Approve user
router.put('/users/:id/approve', async (req, res) => {
    try {
        let user = await User.findById(req.params.id);

        if (!user) return res.status(404).json({ msg: 'User not found' });

        user = await User.findByIdAndUpdate(
            req.params.id,
            { $set: { isApproved: true, isRejected: false } },
            { new: true }
        );

        // Emit WebSocket event to notify user
        if (req.io) {
            req.io.emit('userApproved', { userId: user._id.toString(), user });
            // Also emit the approvalStatusUpdate event for WaitingApproval page
            req.io.emit('approvalStatusUpdate', {
                userId: user._id.toString(),
                email: user.email,
                rollNumber: user.rollNumber,
                status: 'approved',
                role: user.role
            });
        }

        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Reject user
router.put('/users/:id/reject', async (req, res) => {
    try {
        let user = await User.findById(req.params.id);

        if (!user) return res.status(404).json({ msg: 'User not found' });

        user = await User.findByIdAndUpdate(
            req.params.id,
            { $set: { isRejected: true, isApproved: false } },
            { new: true }
        );

        // Emit WebSocket event to notify user
        if (req.io) {
            req.io.emit('userRejected', { userId: user._id.toString(), user });
            // Also emit the approvalStatusUpdate event for WaitingApproval page
            req.io.emit('approvalStatusUpdate', {
                userId: user._id.toString(),
                email: user.email,
                rollNumber: user.rollNumber,
                status: 'rejected',
                role: user.role
            });
        }

        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
    try {
        let user = await User.findById(req.params.id);

        if (!user) return res.status(404).json({ msg: 'User not found' });

        await User.findByIdAndDelete(req.params.id);

        // Emit WebSocket event to notify all clients about user deletion
        if (req.io) {
            req.io.emit('userDeleted', { userId: user._id.toString(), user });
        }

        res.json({ msg: 'User removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
