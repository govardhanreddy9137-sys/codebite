import mongoose from 'mongoose';
import Food from '../src/models/Food.js';
import 'dotenv/config';

const updatePrices = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codebite');
        console.log('Connected to MongoDB');

        // Update all food items price to 150
        const result = await Food.updateMany(
            {},
            { $set: { price: 150 } }
        );

        console.log(`✅ Updated ${result.modifiedCount} food items to ₹150`);
        console.log(`Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);

        // Verify the update
        const foods = await Food.find().select('name price');
        console.log('\nSample of updated prices:');
        foods.slice(0, 5).forEach(f => {
            console.log(`${f.name}: ₹${f.price}`);
        });

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

updatePrices();
