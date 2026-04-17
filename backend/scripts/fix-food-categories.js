import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const foodsPath = path.join(__dirname, '..', 'foods_utf8.json');

try {
    const rawData = fs.readFileSync(foodsPath, 'utf8');
    const data = JSON.parse(rawData.replace(/^\uFEFF/, ''));
    const foods = Array.isArray(data) ? data : (data.value || []);

    const updatedFoods = foods.map(food => {
        const name = (food.name || '').toLowerCase();
        let category = food.category;
        
        // Categorize based on name
        if (name.includes('shake')) {
            category = 'shakes';
        } else if (name.includes('tea') || name.includes('chai')) {
            category = 'tea';
        } else if (name.includes('coffee') || name.includes('milk') || name.includes('juice') || name.includes('lassi') || name.includes('drink') || name.includes('water')) {
            category = 'drinks';
        }

        // Randomize nutrients if they are zero
        let calories = food.calories;
        let protein = food.protein;
        
        if (!calories || calories === 0) {
            if (category === 'shakes') calories = Math.floor(Math.random() * 200) + 300; // 300-500
            else if (category === 'tea' || category === 'drinks') calories = Math.floor(Math.random() * 150) + 50; // 50-200
            else calories = Math.floor(Math.random() * 400) + 200; // 200-600
        }
        
        if (!protein || protein === 0) {
            if (category === 'shakes') protein = Math.floor(Math.random() * 10) + 5; // 5-15
            else if (category === 'tea' || category === 'drinks') protein = Math.floor(Math.random() * 5); // 0-5
            else protein = Math.floor(Math.random() * 20) + 5; // 5-25
        }

        return {
            ...food,
            category,
            calories,
            protein
        };
    });

    const result = Array.isArray(data) ? updatedFoods : { ...data, value: updatedFoods };
    fs.writeFileSync(foodsPath, JSON.stringify(result, null, 4));
    console.log('✅ Successfully updated food categories and nutrients in JSON.');
    
} catch (err) {
    console.error('❌ Error processing foods:', err);
}
