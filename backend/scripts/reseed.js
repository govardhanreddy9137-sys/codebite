import 'dotenv/config';
import mongoose from 'mongoose';
import Food from '../src/models/Food.js';
import Poll from '../src/models/Poll.js';
import Restaurant from '../src/models/Restaurant.js';
import { seedIfEmpty } from '../src/seed.js';

const reseed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🗑 Clearing existing foods, polls, and restaurants...');
    await Food.deleteMany({});
    await Poll.deleteMany({});
    await Restaurant.deleteMany({});

    console.log('🌱 Re-seeding with premium images...');
    await seedIfEmpty();

    console.log('✨ Done! Please restart your backend if needed.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during re-seed:', err);
    process.exit(1);
  }
};

reseed();
