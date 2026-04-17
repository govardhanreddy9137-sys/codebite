// Restart trigger: 2026-04-11 13:59
import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import foodRoutes from './routes/foods.js';
import orderRoutes from './routes/orders.js';
import pollRoutes from './routes/polls.js';
import userRoutes from './routes/users.js';
import restaurantRoutes from './routes/restaurants.js';
import chatRoutes from './routes/chat.js';
import riderRoutes from './routes/rider.js';
import paymentRoutes from './routes/payments.js';
import uploadRoutes from './routes/upload.js';
import galleryRoutes from './routes/gallery.js';
import rewardsRoutes from './routes/rewards.js';
import { seedIfEmpty } from './seed.js';

import connectDB from './config/db.js';

const app = express();
const PORT = process.env.PORT || 3002;
let server; // Define in outer scope

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Unified static assets: resolve all image variants to the high-quality gallery
app.use('/src/images', express.static(path.join(__dirname, '..', '..', 'frontend', 'public', 'images')));
app.use('/images', express.static(path.join(__dirname, '..', '..', 'frontend', 'public', 'images')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/polls', pollRoutes);
app.use('/api/users', userRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/riders', riderRoutes);
app.use('/api/rewards', rewardsRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

// Root route
app.get('/', (req, res) => {
    res.json({
        status: "ONLINE",
        message: "CodeBite Backend is operational."
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Exception:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// Graceful shutdown
const shutdown = () => {
    console.log('\nShutting down gracefully...');
    if (server) {
        server.close(() => {
            console.log('HTTP server closed.');
            mongoose.connection.close();
            console.log('MongoDB connection closed.');
            process.exit(0);
        });
    } else {
        process.exit(0);
    }
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Configuration Integrity Check
const checkConfiguration = () => {
    const report = {
        database: process.env.MONGODB_URI ? 'CONFIGURED' : 'MISSING',
        auth: process.env.JWT_SECRET ? 'CONFIGURED' : 'UNSECURE (MISSING)',
        mailer: {
            user: (process.env.EMAIL_USER && !process.env.EMAIL_USER.includes('your-email')) ? 'CONFIGURED' : 'PLACEHOLDER/MISSING',
            pass: (process.env.EMAIL_PASS && process.env.EMAIL_PASS.length > 5) ? 'CONFIGURED' : 'PLACEHOLDER/MISSING'
        }
    };

    console.log('\n--- 🚀 SYSTEM DEPLOYMENT STATUS ---');
    console.log(`📡 Database (MongoDB): ${report.database}`);
    console.log(`🛡️ Security (JWT): ${report.auth}`);
    console.log(`📧 Mailer (OTP): ${report.mailer.user === 'CONFIGURED' ? '✅ FULLY CONFIGURED' : '📝 DEV MODE (LOGGING TO CONSOLE)'}`);
    console.log('------------------------------------\n');

    return report;
};

// Diagnostics Endpoint
app.get('/api/health/diagnostics', (req, res) => {
    res.json({
        ok: true,
        report: {
            db: !!process.env.MONGODB_URI,
            jwt: !!process.env.JWT_SECRET,
            mailer: (process.env.EMAIL_USER && !process.env.EMAIL_USER.includes('your-email'))
        },
        env: {
            node: process.version,
            platform: process.platform,
            time: new Date().toISOString()
        }
    });
});

// Start Server
const serverInstance = app.listen(PORT, async () => {
    console.log(`🚀 Server listening on port ${PORT}`);
    
    try {
        // Run startup diagnostics
        checkConfiguration();

        // Connect to MongoDB
        await connectDB();
        
        // Seed database if empty
        await seedIfEmpty();
        
        console.log(`✅ Backend services fully initialized!`);
    } catch (err) {
        console.error('❌ Delayed initialization failure:', err);
        // We don't exit here so the process can still respond with errors instead of dropping connections
    }
});

serverInstance.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use.`);
        process.exit(1);
    }
});

