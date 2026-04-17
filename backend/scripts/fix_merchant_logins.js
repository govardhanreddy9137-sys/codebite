import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../src/models/User.js';
import 'dotenv/config';

const fixMerchantLogins = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codebite');
        console.log('Connected to MongoDB');

        const merchants = [
            { email: 'ammachettivanta@gmail.com', name: 'Amma Chetti Vanta' },
            { email: 'andhrameals@gmail.com', name: 'Andhra Meals' },
            { email: 'kalpanahouse@gmail.com', name: 'Kalpana House' },
            { email: 'homemadefood@gmail.com', name: 'Home Made Food' },
            { email: 'ammamagarriillu@gmail.com', name: 'Ammama Garri Illu' },
            { email: 'tasteofpunjab@gmail.com', name: 'Taste of Punjab' }
        ];

        for (const merchant of merchants) {
            // Check if merchant exists
            let user = await User.findOne({ email: merchant.email });
            
            const hashedPassword = await bcrypt.hash('123456', 10);
            
            if (!user) {
                // Create new merchant
                user = new User({
                    email: merchant.email,
                    password: hashedPassword,
                    name: merchant.name,
                    role: 'merchant'
                });
                await user.save();
                console.log(`✅ Created merchant: ${merchant.email}`);
            } else {
                // Update existing user to merchant
                user.password = hashedPassword;
                user.role = 'merchant';
                user.name = merchant.name;
                await user.save();
                console.log(`✅ Updated merchant: ${merchant.email}`);
            }
        }

        // Verify all merchants
        console.log('\n📋 Verifying merchant logins:');
        const allMerchants = await User.find({ role: 'merchant' });
        for (const m of allMerchants) {
            console.log(`  - ${m.email} (${m.name}) - Role: ${m.role}`);
        }

        console.log('\n✅ All merchant logins are ready!');
        console.log('\nLogin credentials:');
        console.log('Email: [merchantname]@gmail.com');
        console.log('Password: 123456');
        console.log('Role: merchant');

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

fixMerchantLogins();
