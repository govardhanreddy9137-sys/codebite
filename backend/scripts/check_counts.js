import mongoose from 'mongoose';
import 'dotenv/config';

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/codebite';

const foodSchema = new mongoose.Schema({ name: String, restaurant: String });
const Food = mongoose.models.Food || mongoose.model('Food', foodSchema);

const restaurantSchema = new mongoose.Schema({ name: String });
const Restaurant = mongoose.models.Restaurant || mongoose.model('Restaurant', restaurantSchema);

async function run() {
    await mongoose.connect(uri);

    const rests = await Restaurant.find().lean();
    console.log(`\nTotal restaurants: ${rests.length}`);

    for (const r of rests) {
        const count = await Food.countDocuments({ restaurant: r.name });
        if (count === 0) {
            console.log(`❌ EMPTY RESTAURANT: ${r.name}`);
        } else {
            console.log(`✅ ${r.name}: ${count} items`);
        }
    }

    mongoose.disconnect();
}
run();
