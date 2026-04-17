const mongoose = require('mongoose');

// Define minimal schemas to avoid model errors
const FoodSchema = new mongoose.Schema({}, { strict: false });
const Food = mongoose.model('Food', FoodSchema, 'foods');
const Restaurant = mongoose.model('Restaurant', FoodSchema, 'restaurants');

const MONGO_URI = 'mongodb://localhost:27017/codebite';

async function fix() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // Fix Food images
        const foods = await Food.find({ image: /^src\/images\// });
        console.log(`Found ${foods.length} foods to update.`);
        for (const f of foods) {
            await Food.updateOne({ _id: f._id }, { $set: { image: '/' + f.image } });
        }

        // Fix Restaurant images
        const rests = await Restaurant.find({ image: /^src\/images\// });
        console.log(`Found ${rests.length} restaurants to update.`);
        for (const r of rests) {
            await Restaurant.updateOne({ _id: r._id }, { $set: { image: '/' + r.image } });
        }

        console.log('Update complete successfully');
    } catch (err) {
        console.error('Update failed:', err);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected');
    }
}

fix();
