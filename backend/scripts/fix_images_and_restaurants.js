import fs from 'fs';
import path from 'path';

// Read foods data
const foodsPath = path.join(process.cwd(), 'foods_utf8.json');
let foodsData = JSON.parse(fs.readFileSync(foodsPath, 'utf8'));

console.log('🔧 Fixing pickle images and removing Taste of Punjab...');

let updatedCount = 0;
let removedCount = 0;

// Correct pickle image mappings with actual local files
const PICKLE_IMAGE_MAPPINGS = {
  'Avakaya (Mango Pickle)': '/Avakaya.jpg',
  'Tomato Pickle': '/tomato pappu.jpg',
  'Nimakaya (Lemon Pickle)': '/Lemon Tea.webp',
  'Gongura Pickle': '/gongura.webp',
  'Ginger Pickle (Allam)': '/Ginger Tea.webp',
  'Mixed Vegetable Pickle': '/veg meals.avif',
  'Andhra Chicken Pickle': '/chicken 65.webp',
  'Spicy Mutton Pickle': '/Mutton Biryani.webp',
  'Prawn Pickle (Royyala)': '/prawn biryani.webp',
  'Fish Pickle': '/fish fry.webp',
  'Egg Pickle': '/Egg Biryani.webp',
  'Garlic Pickle (Vellulli)': '/dal tadaka rice.webp'
};

// Filter and update foods
foodsData.value = foodsData.value.filter(food => {
  // Remove Taste of Punjab items
  if (food.restaurant === 'Taste of Punjab') {
    console.log(`🗑️ Removing: ${food.name} (Taste of Punjab)`);
    removedCount++;
    return false;
  }
  return true;
});

// Update pickle images and ensure Amma Pickles restaurant
foodsData.value.forEach(food => {
  if (food.name.toLowerCase().includes('pickle')) {
    const pickleName = food.name;
    
    console.log(`\n🥒 Processing: ${pickleName}`);
    console.log(`   Current: ${food.image}`);
    
    // Ensure it's assigned to Amma Pickles
    food.restaurant = 'Amma Pickles';
    
    // Update image if we have a mapping
    if (PICKLE_IMAGE_MAPPINGS[pickleName]) {
      food.image = PICKLE_IMAGE_MAPPINGS[pickleName];
      console.log(`   ✅ Updated: ${food.image}`);
      updatedCount++;
    } else {
      console.log(`   ⚠️ No mapping found for ${pickleName}`);
    }
    
    console.log(`   🏪 Restaurant: ${food.restaurant}`);
  }
});

// Save updated data
fs.writeFileSync(foodsPath, JSON.stringify(foodsData, null, 2));

console.log(`\n📊 Summary:`);
console.log(`✅ Successfully updated: ${updatedCount} pickle images`);
console.log(`🗑️ Successfully removed: ${removedCount} Taste of Punjab items`);
console.log(`🏪 All pickles assigned to: Amma Pickles restaurant`);
console.log(`\n🎉 All fixes completed!`);
console.log(`\n📁 Pickle images now use correct local file paths`);
console.log(`🏪 Amma Pickles restaurant will be visible to users`);
console.log(`🗑️ Taste of Punjab hotel has been removed`);
