import fs from 'fs';
import path from 'path';

// High-quality pickle images specifically for Amma Pickles restaurant
const AMMA_PICKLES_IMAGES = {
  'Avakaya (Mango Pickle)': 'https://images.unsplash.com/photo-1598866569169-61a5e2efa8a3?w=400&q=80',
  'Tomato Pickle': 'https://images.unsplash.com/photo-1542991284-689b8309e6a6?w=400&q=80',
  'Nimakaya (Lemon Pickle)': 'https://images.unsplash.com/photo-1590502593747-42a996133562?w=400&q=80',
  'Gongura Pickle': 'https://images.unsplash.com/photo-1546470427-e92b2c9c09d6?w=400&q=80',
  'Ginger Pickle (Allam)': 'https://images.unsplash.com/photo-1589187970436-2e271857e98a?w=400&q=80',
  'Mixed Vegetable Pickle': 'https://images.unsplash.com/photo-1544099652-367ba0091ef6?w=400&q=80',
  'Andhra Chicken Pickle': 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&q=80',
  'Spicy Mutton Pickle': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&q=80',
  'Prawn Pickle (Royyala)': 'https://images.unsplash.com/photo-1562967916-eb82251df943?w=400&q=80',
  'Fish Pickle': 'https://images.unsplash.com/photo-1574486284686-a7a5bc09c0b5?w=400&q=80',
  'Egg Pickle': 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400&q=80',
  'Garlic Pickle (Vellulli)': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80'
};

// Read foods data
const foodsPath = path.join(process.cwd(), 'foods_utf8.json');
let foodsData = JSON.parse(fs.readFileSync(foodsPath, 'utf8'));

console.log('🥒 Updating Amma Pickles restaurant with correct images...');

let updatedCount = 0;

// Update all pickle items to be from "Amma Pickles" restaurant with correct images
foodsData.value.forEach(food => {
  if (food.name.toLowerCase().includes('pickle')) {
    // Update restaurant to Amma Pickles
    food.restaurant = 'Amma Pickles';
    
    // Update image if we have a specific one
    if (AMMA_PICKLES_IMAGES[food.name]) {
      console.log(`🔄 Updating: ${food.name}`);
      console.log(`   Restaurant: ${food.restaurant}`);
      console.log(`   Old: ${food.image}`);
      console.log(`   New: ${AMMA_PICKLES_IMAGES[food.name]}`);
      
      food.image = AMMA_PICKLES_IMAGES[food.name];
      updatedCount++;
    }
  }
});

// Save updated data
fs.writeFileSync(foodsPath, JSON.stringify(foodsData, null, 2));

console.log(`\n✅ Successfully updated ${updatedCount} pickle items for Amma Pickles restaurant!`);
console.log('🎉 All pickles now have correct images and are assigned to Amma Pickles!');
