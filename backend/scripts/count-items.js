import 'dotenv/config';
import mongoose from 'mongoose';
import Food from '../src/models/Food.js';

async function countItems() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const stats = await Food.aggregate([
      { $group: { _id: "$restaurant", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log('\n--- Restaurant Item Counts ---');
    if (stats.length === 0) {
      console.log('No items found in the database.');
    } else {
      stats.forEach(s => {
        console.log(`📍 ${s._id.padEnd(20)} : ${s.count} item(s)`);
      });
    }
    console.log('------------------------------\n');
    process.exit(0);
  } catch (err) {
    console.error('Error counting items:', err);
    process.exit(1);
  }
}

countItems();
