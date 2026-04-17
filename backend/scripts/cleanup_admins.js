import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User.js';

dotenv.config({ path: './.env' });

async function cleanupAdmins() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/codebite');
    console.log('✅ Connected to MongoDB');

    const adminEmail = 'govardhanreddy9137@gmail.com';
    
    // Find all admins
    const admins = await User.find({ role: 'admin' });
    console.log('Current Admins:', admins.map(a => a.email));

    for (const admin of admins) {
      if (admin.email !== adminEmail) {
        console.log(`Demoting ${admin.email} to employee...`);
        admin.role = 'employee';
        await admin.save();
      }
    }

    // Explicitly check for gayathriakula06@gmail.com
    const specificUser = await User.findOne({ email: 'gayathriakula06@gmail.com' });
    if (specificUser && specificUser.role === 'admin') {
      console.log('Demoting gayathriakula06@gmail.com to employee...');
      specificUser.role = 'employee';
      await specificUser.save();
    }

    console.log('✅ Admin cleanup complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }
}

cleanupAdmins();
