const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:3000", "http://localhost:5000", "http://localhost:5173"], // Admin frontend and User frontend
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Listen for new user registration event from User Client
    socket.on('newUserRegistered', (data) => {
        console.log('New user registered:', data);
        // Broadcast to all clients (Admin panel will pick this up)
        io.emit('newUserRegistration', { user: data });
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Middleware
app.use(cors());
app.use(express.json());

// Make io accessible to routes
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Database connection
const MONGODB_URI = process.env.MONGODB_URI;

console.log('Attempting to connect to MongoDB...');
// console.log('URI:', MONGODB_URI); // Debug only, don't expose in prod

mongoose.connection.on('connected', () => {
    console.log('Mongoose event: Connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('Mongoose event: Connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose event: Disconnected');
});

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('Admin Backend: Successfully established connection');
        ensureAdminExists();
    })
    .catch((err) => console.error('MongoDB initial connection error:', err));

// Seed Admin
const ensureAdminExists = async () => {
    try {
        const adminExists = await Admin.findOne({ userId: 'admin' });
        if (!adminExists) {
            console.log('Admin not found. Creating default admin...');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('admin@123456', salt);

            const newAdmin = new Admin({
                userId: 'admin',
                password: hashedPassword
            });
            await newAdmin.save();
            console.log('Default admin account created: admin / admin@123456');
        } else {
            console.log('Admin account already exists.');
        }
    } catch (error) {
        console.error('Error checking/creating admin:', error);
    }
};

// Routes
app.use('/api/admin', require('./routes/adminRoutes'));

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
    console.log(`Admin Backend Server is running on port ${PORT}`);
});
