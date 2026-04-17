import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const imgDir = path.join(__dirname, 'src', 'images');
const jsonPath = path.join(__dirname, 'foods_utf8.json');

// Read existing JSON
const rawData = fs.readFileSync(jsonPath, 'utf8');
const foodsData = JSON.parse(rawData.replace(/^\uFEFF/, ''));
const existingItems = foodsData.value;
const existingImages = existingItems.map(item => path.basename(item.image));

// Read image files
const imgFiles = fs.readdirSync(imgDir).filter(file => {
    const ext = path.extname(file).toLowerCase();
    return ['.webp', '.jpg', '.jpeg', '.png', '.avif'].includes(ext);
});

// Settings
const defaultPrice = 150;
const restaurants = ['Amma Chetti Vanta', 'Andhra Meals', 'Home Made Food', 'Kalpana House', 'Ammama Garri Illu'];

let newItemsCount = 0;
let highestId = Math.max(...existingItems.map(item => item.id), 0);
if (highestId < 100) highestId = 100;

imgFiles.forEach(file => {
    // If the image is already used in an existing item, skip it.
    if (!existingImages.includes(file)) {
        highestId++;
        newItemsCount++;
        const rawName = path.basename(file, path.extname(file));
        const itemName = rawName.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()); // Title Case
        
        // Category guessing
        let category = 'veg';
        const lowerName = itemName.toLowerCase();
        if (lowerName.includes('chicken') || lowerName.includes('mutton') || lowerName.includes('egg') || lowerName.includes('fish') || lowerName.includes('beef') || lowerName.includes('prawn') || lowerName.includes('keema')) {
            category = 'nonveg';
        } else if (lowerName.includes('idli') || lowerName.includes('dosa') || lowerName.includes('vada') || lowerName.includes('upma') || lowerName.includes('tea') || lowerName.includes('coffee') || lowerName.includes('shake') || lowerName.includes('lassi')) {
            category = 'tiffens';
        }
        
        const restaurant = restaurants[Math.floor(Math.random() * restaurants.length)];

        const newItem = {
            id: highestId, // using random high id or incremental
            name: itemName,
            price: defaultPrice,
            description: `Delicious ${itemName}`,
            aiDescription: `Perfectly prepared ${itemName} that will tantalize your taste buds.`,
            image: `src/images/${file}`,
            restaurant: restaurant,
            category: category,
            calories: 0,
            protein: 0,
            carbs: 0,
            __v: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        existingItems.push(newItem);
    }
});

// Update the Count and list
foodsData.value = existingItems;
foodsData.Count = existingItems.length;

// Save back to JSON
fs.writeFileSync(jsonPath, JSON.stringify(foodsData, null, 4), 'utf8');

console.log(`Successfully added ${newItemsCount} new items from the images folder. Total items now: ${foodsData.Count}`);

// Let's also sync to foods.json so both are identical
const foodsJsonPath = path.join(__dirname, 'foods.json');
try {
    fs.writeFileSync(foodsJsonPath, JSON.stringify(foodsData, null, 4), 'utf8');
    console.log(`Synced list to ${foodsJsonPath}`);
} catch(e) {
    console.warn("Could not sync to foods.json:", e.message);
}
