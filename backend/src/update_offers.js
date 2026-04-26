import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

import Restaurant from './models/Restaurant.js';
import Food from './models/Food.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/codebite';

const updateOffers = async () => {
    try {
        console.log('🚀 Connecting to Database...');
        await mongoose.connect(MONGODB_URI);

        console.log('📊 Updating Restaurant Offers...');
        
        // 1. Update Kalpana House specifically
        await Restaurant.findOneAndUpdate(
            { name: 'Kalpana House' },
            { $set: { offer: '20% Off' } }
        );
        console.log('✅ Updated Kalpana House offer to 20% Off');

        // 2. Update all restaurants to 20% Off if they have a numerical discount or specific strings
        const restaurants = await Restaurant.find({});
        for (const res of restaurants) {
            if (res.offer && (res.offer.includes('10%') || res.offer.includes('15%') || res.offer.includes('Buy 2 Get 1'))) {
                res.offer = '20% Off';
                await res.save();
                console.log(`✅ Updated ${res.name} offer to 20% Off`);
            }
        }

        console.log('🍱 Discounting Food Prices by 20%...');
        const foods = await Food.find({});
        let updatedFoods = 0;
        for (const food of foods) {
            // We assume the current price is the base price and we apply a 20% discount
            const originalPrice = food.price;
            const newPrice = Math.round(originalPrice * 0.8);
            
            if (newPrice !== originalPrice) {
                food.price = newPrice;
                await food.save();
                updatedFoods++;
            }
        }
        console.log(`✨ Successfully discounted ${updatedFoods} food items.`);

        console.log('🎉 Maintenance Complete!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Update failed:', err);
        process.exit(1);
    }
};

updateOffers();
