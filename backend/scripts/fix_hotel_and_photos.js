import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/codebite';

const foodSchema = new mongoose.Schema({ name: String, image: String, restaurant: String }, { strict: false });
const Food = mongoose.models.Food || mongoose.model('Food', foodSchema);

const restaurantSchema = new mongoose.Schema({ name: String }, { strict: false });
const Restaurant = mongoose.models.Restaurant || mongoose.model('Restaurant', restaurantSchema);

const rootDir = path.join(process.cwd(), '..');

const fallbacks = [
    'src/images/veg meals.avif',
    'src/images/chicken biryani.webp',
    'src/images/masala dosa.jpg',
    'src/images/Butter Chicken.webp',
    'src/images/Aloo Paratha.webp',
    'src/images/Idli Sambar.webp',
    'src/images/Mutton Biryani.webp',
    'src/images/Filter Coffee.webp'
];

async function run() {
    try {
        await mongoose.connect(uri);
        console.log('Connected to DB');

        // 1. Remove Hotel Taj Palace
        await Restaurant.findOneAndDelete({ name: 'Hotel Taj Palace' });
        await Food.deleteMany({ restaurant: 'Hotel Taj Palace' });
        console.log('Deleted Hotel Taj Palace from DB.');

        // Clean JSONs
        const cleanJson = (filePath, filterFn) => {
            const p = path.join(rootDir, filePath);
            if (fs.existsSync(p)) {
                let raw = fs.readFileSync(p, 'utf8').replace(/^\uFEFF/, '');
                const data = JSON.parse(raw);
                const arr = Array.isArray(data) ? data : (data.value || []);
                const filtered = arr.filter(filterFn);
                const toWrite = Array.isArray(data) ? filtered : { value: filtered };
                fs.writeFileSync(p, JSON.stringify(toWrite, null, 4), 'utf8');
                return filtered;
            }
            return [];
        };

        cleanJson('restaurants_utf8.json', r => r.name !== 'Hotel Taj Palace');
        let jsonFoods = cleanJson('foods_utf8.json', f => f.restaurant !== 'Hotel Taj Palace');

        // 2. Fix missing photos in DB
        const allFoods = await Food.find({});
        let fixCount = 0;

        for (const food of allFoods) {
            let imagePath = food.image;
            if (!imagePath) { imagePath = 'BAD'; }
            if (imagePath.startsWith('/')) { imagePath = imagePath.slice(1); } // Normalize '/src/images/...' -> 'src/images/...'

            const absolutePath = path.join(rootDir, imagePath);

            if (!fs.existsSync(absolutePath)) {
                // Photo is missing! Pick a fallback.
                const newImg = fallbacks[Math.floor(Math.random() * fallbacks.length)];
                food.image = newImg;
                await food.save();
                fixCount++;
                
                // Also update in JSON so it persists
                const jsonItem = jsonFoods.find(f => f.name === food.name && f.restaurant === food.restaurant);
                if (jsonItem) {
                    jsonItem.image = newImg;
                }
            }
        }

        // Save fixed JSON
        const foodsP = path.join(rootDir, 'foods_utf8.json');
        if (fs.existsSync(foodsP)) {
            let raw = fs.readFileSync(foodsP, 'utf8').replace(/^\uFEFF/, '');
            const data = JSON.parse(raw);
            const toWrite = Array.isArray(data) ? jsonFoods : { value: jsonFoods };
            fs.writeFileSync(foodsP, JSON.stringify(toWrite, null, 4), 'utf8');
        }

        console.log(`Verified photos. Fixed missing images for ${fixCount} items.`);

    } catch (e) {
        console.error(e);
    } finally {
        mongoose.disconnect();
    }
}
run();
