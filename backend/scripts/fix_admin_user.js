import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../src/models/User.js';
import 'dotenv/config';

const fixAdminUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codebite');
        console.log('Connected to MongoDB');

        // Find govardhan@gmail.com
        let user = await User.findOne({ email: 'govardhan@gmail.com' });
        
        if (!user) {
            console.log('User govardhan@gmail.com not found, creating...');
            const hashedPassword = await bcrypt.hash('123456', 10);
            user = new User({
                name: 'Govardhan',
                email: 'govardhan@gmail.com',
                password: hashedPassword,
                role: 'admin'
            });
            await user.save();
            console.log('✅ Created admin user: govardhan@gmail.com');
        } else {
            console.log('User found:', user.email);
            console.log('Current role:', user.role);
            
            // Update password to 123456
            const hashedPassword = await bcrypt.hash('123456', 10);
            user.password = hashedPassword;
            user.role = 'admin';
            await user.save();
            console.log('✅ Updated password to 123456 and set role to admin');
        }

        console.log('\n✅ Admin login ready:');
        console.log('Email: govardhan@gmail.com');
        console.log('Password: 123456');
        console.log('Role: admin');

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

fixAdminUser();
