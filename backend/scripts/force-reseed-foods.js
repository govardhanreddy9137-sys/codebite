import 'dotenv/config';
import mongoose from 'mongoose';
import Food from '../src/models/Food.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function forceReseed() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Cleaning up existing foods...');
        await Food.deleteMany({});
        
        const foodsPath = path.join(__dirname, '..', 'foods_utf8.json');
        const rawData = fs.readFileSync(foodsPath, 'utf8');
        const data = JSON.parse(rawData.replace(/^\uFEFF/, ''));
        const foodsData = Array.isArray(data) ? data : (data.value || []);
        
        console.log(`Seeding ${foodsData.length} updated foods...`);
        // Remove MongoDB fields created previously if they exist
        const cleanedData = foodsData.map(f => {
            const { _id, __v, createdAt, updatedAt, ...rest } = f;
            return rest;
        });
        
        await Food.insertMany(cleanedData);
        console.log('✅ Force re-seed successful!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Force re-seed FAILED:', err);
        process.exit(1);
    }
}

forceReseed();
