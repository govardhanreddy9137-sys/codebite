import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

import Restaurant from './models/Restaurant.js';
import Food from './models/Food.js';
import Poll from './models/Poll.js';

const MONGODB_URI = process.env.MONGODB_URI;

const AI_RESTAURANT_IMAGES = [
    "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1200&q=80", // High-end Cinematic Restaurant
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80", // Dark Moody Dining
    "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1200&q=80", // Modern Gourmet
    "https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&w=1200&q=80", // Upscale City View
    "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80", // Chic Bistro
    "https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?auto=format&fit=crop&w=1200&q=80"  // Luxury Lounge
];

const AI_FOOD_IMAGES = {
    "Biryani": "https://images.unsplash.com/photo-1589302168068-1c4815c14436?auto=format&fit=crop&w=800&q=80",
    "Pizza": "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
    "Dosa": "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=800&q=80",
    "Burger": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
    "Chicken": "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=800&q=80",
    "Coffee": "https://images.unsplash.com/photo-1541167760496-162955ed8a9f?auto=format&fit=crop&w=800&q=80",
    "Meals": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80"
};

const BREAKING_AI_POLLS = [
    { name: "Neo-Saffron Biryani", price: 450, description: "AI-optimized spice blend for cognitive performance.", image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=800&q=80" },
    { name: "Cyber-Pasta Alpha", price: 320, description: "Holographic visuals meet traditional Italian craft.", image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80" },
    { name: "Quantum Sushi", price: 580, description: "Superposition of flavors in every bite.", image: "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=800&q=80" }
];

const syncAIBranding = async () => {
    try {
        console.log('🤖 INITIALIZING AI BRANDING ENGINE [V2]...');
        await mongoose.connect(MONGODB_URI);
        
        // 1. Update Restaurants
        const restaurants = await Restaurant.find();
        for (let i = 0; i < restaurants.length; i++) {
            const img = AI_RESTAURANT_IMAGES[i % AI_RESTAURANT_IMAGES.length];
            const name = restaurants[i].name === "Hotel Swagath" ? "Hotel Shelton Restaurants" : restaurants[i].name;
            await Restaurant.findByIdAndUpdate(restaurants[i]._id, { image: img, name: name });
            console.log(`✨ AI Branding Applied: ${name}`);
        }

        // 2. Update Foods
        const foods = await Food.find();
        for (const food of foods) {
            let aiImg = AI_FOOD_IMAGES["Meals"]; // Default
            for (const key in AI_FOOD_IMAGES) {
                if (food.name.toLowerCase().includes(key.toLowerCase())) {
                    aiImg = AI_FOOD_IMAGES[key];
                    break;
                }
            }
            await Food.findByIdAndUpdate(food._id, { image: aiImg });
        }

        // 3. Clear and Sync Polls (Breaking AI Concepts)
        await Poll.deleteMany({});
        for (const p of BREAKING_AI_POLLS) {
            await Poll.create(p);
        }
        
        console.log('✅ AI BRANDING & BREAKING CONCEPTS SYNCHRONIZED.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Branding failed:', err);
        process.exit(1);
    }
};

syncAIBranding();
