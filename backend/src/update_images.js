import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load .env from the backend root
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Import models
import Food from './models/Food.js';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in .env');
    process.exit(1);
}

const imagesDir = path.join(__dirname, '..', '..', 'frontend', 'public', 'images');
const foodsJsonPath = path.join(__dirname, '..', '..', 'data', 'foods_utf8.json');

const updateImages = async () => {
    try {
        console.log('🚀 Starting Image Gallery Synchronization...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // 1. Get List of available images
        const files = fs.readdirSync(imagesDir);
        const imageMap = new Map();
        files.forEach(f => {
            const nameWithoutExt = f.split('.')[0].toLowerCase().trim();
            imageMap.set(nameWithoutExt, `/images/${f}`);
        });

        console.log(`📊 Found ${files.length} images in gallery.`);

        // 2. Update MongoDB Documents
        const foods = await Food.find({});
        console.log(`🔍 Checking ${foods.length} food items...`);

        let updatedCount = 0;
        for (const food of foods) {
            const normalizedName = food.name.toLowerCase().trim();
            
            // Try direct match
            let imagePath = imageMap.get(normalizedName);
            
            // Try fuzzy matches
            if (!imagePath) {
                const cleanedName = normalizedName
                    .replace(/\(.*\)/, '')
                    .replace(/\+.*$/, '')
                    .replace(/pcs/, '')
                    .trim();
                imagePath = imageMap.get(cleanedName);
            }

            // Fallback for biryanis
            if (!imagePath && normalizedName.includes('biryani')) {
                if (normalizedName.includes('chicken')) imagePath = imageMap.get('chicken biryani') || imageMap.get('hyderabadi dum biryani');
                if (normalizedName.includes('mutton')) imagePath = imageMap.get('mutton biryani');
                if (normalizedName.includes('veg')) imagePath = imageMap.get('veg biryani') || imageMap.get('veg dum biryani');
                if (normalizedName.includes('egg')) imagePath = imageMap.get('egg biryani');
            }

            if (imagePath && food.image !== imagePath) {
                food.image = imagePath;
                await food.save();
                updatedCount++;
                console.log(`   ✨ Updated [${food.name}] -> ${imagePath}`);
            }
        }

        console.log(`✅ Successfully updated ${updatedCount} items in database.`);

        // 3. Update JSON seed file
        if (fs.existsSync(foodsJsonPath)) {
            const rawData = fs.readFileSync(foodsJsonPath, 'utf8');
            const data = JSON.parse(rawData.replace(/^\uFEFF/, ''));
            const jsonFoods = data.value || data;

            let jsonUpdated = 0;
            const updatedJsonFoods = jsonFoods.map(f => {
                const normalizedName = f.name.toLowerCase().trim();
                let imagePath = imageMap.get(normalizedName);
                
                if (!imagePath) {
                    const cleanedName = normalizedName.replace(/\(.*\)/, '').replace(/\+.*$/, '').replace(/pcs/, '').trim();
                    imagePath = imageMap.get(cleanedName);
                }

                if (imagePath) {
                    jsonUpdated++;
                    return { ...f, image: imagePath };
                }
                return f;
            });

            fs.writeFileSync(foodsJsonPath, JSON.stringify({ value: updatedJsonFoods }, null, 2));
            console.log(`📝 Updated ${jsonUpdated} items in ${path.basename(foodsJsonPath)}`);
        }

        process.exit(0);
    } catch (err) {
        console.error('❌ Sync failed:', err);
        process.exit(1);
    }
};

updateImages();
