import mongoose from 'mongoose';
import User from '../src/models/User.js';
import { comparePassword } from '../src/utils/bcrypt.js';
import dotenv from 'dotenv';

dotenv.config();

async function testLogin() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected.');

    const email = 'gayatriakula06@gmail.com';
    const password = 'any'; // Testing the register/login flow

    console.log('Looking for user:', email);
    let user = await User.findOne({ email });
    
    if (!user) {
      console.log('User not found, attempting auto-register...');
      user = new User({
        email,
        password,
        name: 'Gayatri',
        role: 'employee'
      });
      await user.save();
      console.log('Auto-registered user.');
    } else {
      console.log('User found, comparing password...');
      const isMatch = await comparePassword(password, user.password);
      console.log('Password match:', isMatch);
    }
    
    console.log('Login logic finished successfully.');
    process.exit(0);
  } catch (err) {
    console.error('DIAGNOSTIC FAILED:');
    console.error(err);
    process.exit(1);
  }
}

testLogin();
