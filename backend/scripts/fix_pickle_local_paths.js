import fs from 'fs';
import path from 'path';

// Read foods data
const foodsPath = path.join(process.cwd(), 'foods_utf8.json');
let foodsData = JSON.parse(fs.readFileSync(foodsPath, 'utf8'));

console.log('🔧 Fixing pickle image paths for public directory...');

let updatedCount = 0;

// Update all pickle items with correct public directory paths
foodsData.value.forEach(food => {
  if (food.name.toLowerCase().includes('pickle')) {
    const pickleName = food.name;
    
    console.log(`\n🥒 Processing: ${pickleName}`);
    console.log(`   Current: ${food.image}`);
    
    // Update paths to use public directory
    if (food.image.includes('/CodeBite _ Smart Office Food Ordering_files/')) {
      // Keep the same path but ensure it starts correctly
      food.image = food.image.replace('/CodeBite _ Smart Office Food Ordering_files/', '/CodeBite _ Smart Office Food Ordering_files/');
      console.log(`   ✅ Fixed: ${food.image}`);
      updatedCount++;
    } else if (food.image.startsWith('CodeBite _ Smart Office Food Ordering_files/')) {
      // Add leading slash
      food.image = '/' + food.image;
      console.log(`   ✅ Added slash: ${food.image}`);
      updatedCount++;
    }
  }
});

// Save updated data
fs.writeFileSync(foodsPath, JSON.stringify(foodsData, null, 2));

console.log(`\n📊 Summary:`);
console.log(`✅ Successfully fixed: ${updatedCount} pickle image paths`);
console.log(`\n🎉 All pickle image paths are now correct for public directory!`);
console.log(`\n📁 Images will be served from: /CodeBite _ Smart Office Food Ordering_files/`);
