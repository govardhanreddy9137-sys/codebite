import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../src/models/User.js';

const seedCustomUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const usersToSeed = [
      {
        email: 'govardhanreddy9137@gmail.com',
        password: 'govardhan@123',
        name: 'Govardhan Reddy',
        role: 'admin'
      },
      {
        email: 'rider1@codebite.com',
        password: 'rider1@123',
        name: 'Rider One',
        role: 'rider',
        phone: '1111111111'
      },
      {
        email: 'rider2@codebite.com',
        password: 'rider2@123',
        name: 'Rider Two',
        role: 'rider',
        phone: '2222222222'
      }
    ];

    for (const data of usersToSeed) {
      await User.deleteOne({ email: data.email }); // Clean existing
      const newUser = new User(data);
      await newUser.save();
      console.log(`✅ Seeded ${data.role} user: ${data.email}`);
    }

    console.log('✅ Custom user setup complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding users', err);
    process.exit(1);
  }
};

seedCustomUsers();
