import mongoose from 'mongoose';
import User from '../src/models/User.js';
import 'dotenv/config';

const makeAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codebite');
        console.log('Connected to MongoDB');

        // Update govardhan@gmail.com to admin
        const result = await User.updateOne(
            { email: 'govardhan@gmail.com' },
            { $set: { role: 'admin' } }
        );

        if (result.matchedCount === 0) {
            console.log('❌ User govardhan@gmail.com not found');
        } else if (result.modifiedCount === 1) {
            console.log('✅ Updated govardhan@gmail.com to admin role');
        } else {
            console.log('ℹ️ User already has admin role');
        }

        // Verify the change
        const user = await User.findOne({ email: 'govardhan@gmail.com' });
        console.log('\nUser details:');
        console.log('Email:', user.email);
        console.log('Name:', user.name);
        console.log('Role:', user.role);

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

makeAdmin();
