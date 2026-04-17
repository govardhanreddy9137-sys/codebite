import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

import Restaurant from './models/Restaurant.js';
import Food from './models/Food.js';
import Poll from './models/Poll.js';

const MONGODB_URI = process.env.MONGODB_URI;
const IMAGES_DIR = path.join(__dirname, '..', '..', 'frontend', 'public', 'images');

const syncLocalGallery = async () => {
    try {
        console.log('🖼️  INITIALIZING LOCAL GALLERY SYNC...');
        await mongoose.connect(MONGODB_URI);
        
        if (!fs.existsSync(IMAGES_DIR)) {
            console.error('❌ Images directory not found:', IMAGES_DIR);
            process.exit(1);
        }

        const files = fs.readdirSync(IMAGES_DIR);
        console.log(`📂 Found ${files.length} files in local gallery.`);

        const normalize = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, '');

        // 1. Sync Foods
        const foods = await Food.find();
        let foodMatches = 0;
        for (const food of foods) {
            const foodNorm = normalize(food.name);
            const match = files.find(file => {
                const fileBase = normalize(path.parse(file).name);
                return fileBase === foodNorm || foodNorm.includes(fileBase) || fileBase.includes(foodNorm);
            });

            if (match) {
                const localPath = `/images/${match}`;
                await Food.findByIdAndUpdate(food._id, { image: localPath });
                console.log(`✅ Food Linked: "${food.name}" -> ${localPath}`);
                foodMatches++;
            }
        }

        // 2. Sync Polls (Breaking Images)
        const polls = await Poll.find();
        let pollMatches = 0;
        for (const poll of polls) {
            const pollNorm = normalize(poll.name);
            const match = files.find(file => {
                const fileBase = normalize(path.parse(file).name);
                return fileBase === pollNorm || pollNorm.includes(fileBase) || fileBase.includes(pollNorm);
            });

            if (match) {
                const localPath = `/images/${match}`;
                await Poll.findByIdAndUpdate(poll._id, { image: localPath });
                console.log(`🔥 Poll Linked: "${poll.name}" -> ${localPath}`);
                pollMatches++;
            }
        }

        // 3. Update "Hotel Shelton" Restaurant Image specifically if found
        const sheltonMatch = files.find(f => normalize(f).includes('shelton') || normalize(f).includes('hotel'));
        if (sheltonMatch) {
            await Restaurant.findOneAndUpdate({ name: "Hotel Shelton Restaurants" }, { image: `/images/${sheltonMatch}` });
            console.log(`🏢 Restaurant Image Linked: Hotel Shelton -> /images/${sheltonMatch}`);
        }

        console.log(`\n✨ SYNC COMPLETE: ${foodMatches} Foods linked, ${pollMatches} Polls linked.`);
        process.exit(0);
    } catch (err) {
        console.error('❌ Sync failed:', err);
        process.exit(1);
    }
};

syncLocalGallery();
