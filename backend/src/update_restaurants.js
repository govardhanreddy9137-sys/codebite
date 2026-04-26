import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
dotenv.config({ path: path.join(__dirname, '..', '.env') });

import Restaurant from './models/Restaurant.js';

const MONGODB_URI = process.env.MONGODB_URI;

const updateRestaurants = async () => {
    try {
        console.log('🚀 Synchronizing Restaurant Imagery...');
        await mongoose.connect(MONGODB_URI);

        const mappings = [
            { name: 'Amma Chetti Vanta', image: '/images/restaurants/amma_chetti_vanta.png' },
            { name: 'Andhra Meals', image: '/images/restaurants/andhra_meals.png' },
            { name: 'Hotel Taj Palace', image: '/images/restaurants/taj_palace.png' },
            { name: 'Taste of Punjab', image: '/images/Butter Chicken.webp' }, // Fallback to a high-quality food photo for now
            { name: 'Kalpana House', image: '/images/restaurants/kalpana_house.png' },
            { name: 'Home Made Food', image: '/images/Aloo Curry + Chapati.webp' },
            { name: 'Paradise Hotel', image: '/images/hyderabadi dum biryani.webp' },
            { name: 'Ammama Garri Illu', image: '/images/pulihora.webp' },
            { name: 'Mehfil', image: '/images/mutton biryani.webp' },
            { name: 'Srikanya', image: '/images/fish curry.webp' },
            { name: 'Biryani Zone', image: '/images/chicken biryani.webp' },
            { name: 'Hotel Swagath', image: '/images/masala dosa.jpg' }
        ];

        let updated = 0;
        for (const map of mappings) {
            const res = await Restaurant.findOneAndUpdate(
                { name: map.name },
                { $set: { image: map.image } },
                { new: true }
            );
            if (res) {
                updated++;
                console.log(`✅ Updated [${map.name}] -> ${map.image}`);
            }
        }

        console.log(`✨ Successfully synchronized ${updated} restaurants.`);
        process.exit(0);
    } catch (err) {
        console.error('❌ Sync failed:', err);
        process.exit(1);
    }
};

updateRestaurants();
