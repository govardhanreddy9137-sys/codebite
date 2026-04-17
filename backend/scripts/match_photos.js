import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/codebite';

const foodSchema = new mongoose.Schema({ name: String, image: String, restaurant: String }, { strict: false });
const Food = mongoose.models.Food || mongoose.model('Food', foodSchema);

const rootDir = path.join(process.cwd(), '..');
const imagesDir = path.join(rootDir, 'src', 'images');

async function run() {
    try {
        await mongoose.connect(uri);
        console.log('Connected to DB');

        // Get all available image filenames natively
        const imageFiles = fs.readdirSync(imagesDir).filter(f => !fs.statSync(path.join(imagesDir, f)).isDirectory());
        
        // Helper to find best match
        const findBestMatch = (foodName) => {
            const normalizedFood = foodName.toLowerCase().replace(/[^a-z0-9 ]/g, '');
            const words = normalizedFood.split(' ');
            
            let bestMatch = null;
            let highestScore = 0;

            for (const file of imageFiles) {
                const normalizedFile = file.toLowerCase().replace(/\.[^/.]+$/, "").replace(/[^a-z0-9 ]/g, '');
                
                // Exact match
                if (normalizedFood === normalizedFile) return file;
                
                // Contains logic
                if (normalizedFile.includes(normalizedFood) || normalizedFood.includes(normalizedFile)) {
                    return file;
                }

                // Word count match
                let score = 0;
                for (const w of words) {
                    if (w.length > 2 && normalizedFile.includes(w)) {
                        score += w.length;
                    }
                }
                if (score > highestScore) {
                    highestScore = score;
                    bestMatch = file;
                }
            }
            return highestScore > 3 ? bestMatch : null;
        };

        const allFoods = await Food.find({});
        let matchedCount = 0;

        for (const food of allFoods) {
            const bestImage = findBestMatch(food.name);
            if (bestImage) {
                food.image = `src/images/${bestImage}`;
                await food.save();
                matchedCount++;
                console.log(`Matched [${food.name}] -> ${bestImage}`);
            } else {
                console.log(`NO MATCH for [${food.name}]`);
            }
        }

        // Also update foods_utf8.json so it doesn't get overwritten on restart
        const foodsP = path.join(rootDir, 'foods_utf8.json');
        if (fs.existsSync(foodsP)) {
            let raw = fs.readFileSync(foodsP, 'utf8').replace(/^\uFEFF/, '');
            const data = JSON.parse(raw);
            const arr = Array.isArray(data) ? data : (data.value || []);
            
            for (const item of arr) {
                const bestImage = findBestMatch(item.name);
                if (bestImage) {
                    item.image = `src/images/${bestImage}`;
                }
            }
            
            const toWrite = Array.isArray(data) ? arr : { value: arr };
            fs.writeFileSync(foodsP, JSON.stringify(toWrite, null, 4), 'utf8');
        }

        console.log(`\nSuccessfully mapped accurate photos for ${matchedCount}/${allFoods.length} items!`);

    } catch (e) {
        console.error(e);
    } finally {
        mongoose.disconnect();
    }
}
run();
