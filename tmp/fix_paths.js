import mongoose from 'mongoose';
import Food from '../codebite/backend/src/models/Food.js';
import Restaurant from '../codebite/backend/src/models/Restaurant.js';
import 'dotenv/config';

const MONGO_URI = 'mongodb://localhost:27017/codebite';

async function fixPaths() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const foods = await Food.find({});
    let foodCount = 0;
    for (const f of foods) {
      if (f.image && !f.image.startsWith('/') && !f.image.startsWith('http')) {
        f.image = '/' + f.image;
        await f.save();
        foodCount++;
      }
    }
    console.log(`Updated ${foodCount} food image paths.`);

    const rests = await Restaurant.find({});
    let restCount = 0;
    for (const r of rests) {
      if (r.image && !r.image.startsWith('/') && !r.image.startsWith('http')) {
        r.image = '/' + r.image;
        await r.save();
        restCount++;
      }
    }
    console.log(`Updated ${restCount} restaurant image paths.`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (err) {
    console.error('Error fixing paths:', err);
    process.exit(1);
  }
}

fixPaths();
