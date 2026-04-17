import 'dotenv/config';
import mongoose from 'mongoose';
import Food from '../src/models/Food.js';

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    const items = await Food.find({ category: { $in: ['drinks', 'shakes', 'tea'] } });
    console.log(`Found ${items.length} items in Shakes/Drinks/Tea categories:`);
    items.forEach(i => console.log(`- ${i.name} (category: ${i.category})`));
    process.exit(0);
}
check();
