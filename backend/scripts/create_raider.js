import mongoose from 'mongoose';
import User from '../src/models/User.js';
import 'dotenv/config';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/codebite';

async function createRaider() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const email = 'raider@gmail.com';
    const email2 = 'raider1@gmail.com';
    const password = 'raider@123';
    
    // The User model handles password hashing in pre-save hook
    const raider1Data = { email, password, role: 'rider', name: 'Captain Raider' };
    const raider2Data = { email: email2, password, role: 'rider', name: 'Captain Raider 1' };

    for (const data of [raider1Data, raider2Data]) {
        let user = await User.findOne({ email: data.email });
        if (user) {
            console.log(`Updating existing user ${data.email}...`);
            user.password = data.password;
            user.role = 'rider';
            user.name = data.name;
            await user.save();
        } else {
            console.log(`Creating new user ${data.email}...`);
            user = new User(data);
            await user.save();
        }
    }

    console.log('✅ Raider account ready:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Role: rider`);

    // Reset Admin as well
    const adminEmail = 'govardhan@gmail.com';
    const adminPass = 'govardhan@123';
    let admin = await User.findOne({ email: adminEmail });
    if (admin) {
      admin.password = adminPass;
      admin.role = 'admin';
      await admin.save();
      console.log('✅ Admin credentials reset:');
      console.log(`   Email: ${adminEmail}`);
      console.log(`   Password: ${adminPass}`);
    } else {
      admin = new User({
        email: adminEmail,
        password: adminPass,
        role: 'admin',
        name: 'Admin User'
      });
      await admin.save();
      console.log('✅ Admin account created:');
      console.log(`   Email: ${adminEmail}`);
      console.log(`   Password: ${adminPass}`);
    }
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

createRaider();
