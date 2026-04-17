import mongoose from 'mongoose';
import Food from '../src/models/Food.js';
import 'dotenv/config';

const fixFoodImages = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codebite');
        console.log('Connected to MongoDB');

        const foods = await Food.find();
        console.log(`Found ${foods.length} food items`);

        let updated = 0;
        for (const food of foods) {
            if (food.image && food.image.startsWith('src/images/')) {
                const newPath = food.image.replace('src/images/', '/images/');
                console.log(`Updating: ${food.name}`);
                console.log(`  Old: ${food.image}`);
                console.log(`  New: ${newPath}`);
                
                await Food.updateOne(
                    { _id: food._id },
                    { $set: { image: newPath } }
                );
                updated++;
            }
        }

        console.log(`\n✅ Updated ${updated} food items`);
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

fixFoodImages();
