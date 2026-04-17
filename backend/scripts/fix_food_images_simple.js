import fs from 'fs';
import path from 'path';

// High-quality food image URLs from Unsplash
const FOOD_IMAGE_URLS = {
  // Pickles
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
  'Garlic Pickle (Vellulli)': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80',
  
  // General food items that might need better images
  'Veg Meals': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&q=80',
  'Idli (4 pcs)': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80',
  'Masala Dosa': 'https://images.unsplash.com/photo-1589301765548-2cf9b2b39bb7?w=400&q=80',
  'Tomato Pappu + Rice': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&q=80',
  
  // Voting list default
  'voting_list': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&q=80'
};

// Read the foods data
const foodsPath = path.join(process.cwd(), 'foods_utf8.json');
let foodsData = JSON.parse(fs.readFileSync(foodsPath, 'utf8'));

console.log('🖼️ Updating food images with high-quality stock photos...');

let updatedCount = 0;

// Update pickle and other food images
foodsData.value.forEach(food => {
  const foodName = food.name;
  
  // Check if this food has a predefined image URL
  if (FOOD_IMAGE_URLS[foodName]) {
    console.log(`🔄 Updating: ${foodName}`);
    console.log(`   Old: ${food.image}`);
    console.log(`   New: ${FOOD_IMAGE_URLS[foodName]}`);
    
    food.image = FOOD_IMAGE_URLS[foodName];
    updatedCount++;
  }
  
  // Also update any food that currently has a placeholder or incorrect image
  if (food.image && (
    food.image.includes('pickles.png') || 
    food.image.includes('Lemon Tea.webp') ||
    food.image.includes('Ginger Tea.webp') ||
    food.image.includes('tomato pappu.jpg') ||
    food.image.includes('veg meals.avif')
  )) {
    // Try to match by category or name
    if (food.name.toLowerCase().includes('pickle')) {
      if (food.name.toLowerCase().includes('mango') || food.name.toLowerCase().includes('avakaya')) {
        food.image = FOOD_IMAGE_URLS['Avakaya (Mango Pickle)'];
        updatedCount++;
      } else if (food.name.toLowerCase().includes('tomato')) {
        food.image = FOOD_IMAGE_URLS['Tomato Pickle'];
        updatedCount++;
      } else if (food.name.toLowerCase().includes('lemon') || food.name.toLowerCase().includes('nimakaya')) {
        food.image = FOOD_IMAGE_URLS['Nimakaya (Lemon Pickle)'];
        updatedCount++;
      } else if (food.name.toLowerCase().includes('gongura')) {
        food.image = FOOD_IMAGE_URLS['Gongura Pickle'];
        updatedCount++;
      } else if (food.name.toLowerCase().includes('ginger') || food.name.toLowerCase().includes('allam')) {
        food.image = FOOD_IMAGE_URLS['Ginger Pickle (Allam)'];
        updatedCount++;
      } else if (food.name.toLowerCase().includes('mixed') || food.name.toLowerCase().includes('vegetable')) {
        food.image = FOOD_IMAGE_URLS['Mixed Vegetable Pickle'];
        updatedCount++;
      } else if (food.name.toLowerCase().includes('chicken')) {
        food.image = FOOD_IMAGE_URLS['Andhra Chicken Pickle'];
        updatedCount++;
      } else if (food.name.toLowerCase().includes('mutton')) {
        food.image = FOOD_IMAGE_URLS['Spicy Mutton Pickle'];
        updatedCount++;
      } else if (food.name.toLowerCase().includes('prawn') || food.name.toLowerCase().includes('royyala')) {
        food.image = FOOD_IMAGE_URLS['Prawn Pickle (Royyala)'];
        updatedCount++;
      } else if (food.name.toLowerCase().includes('fish')) {
        food.image = FOOD_IMAGE_URLS['Fish Pickle'];
        updatedCount++;
      } else if (food.name.toLowerCase().includes('egg')) {
        food.image = FOOD_IMAGE_URLS['Egg Pickle'];
        updatedCount++;
      } else if (food.name.toLowerCase().includes('garlic') || food.name.toLowerCase().includes('vellulli')) {
        food.image = FOOD_IMAGE_URLS['Garlic Pickle (Vellulli)'];
        updatedCount++;
      }
    }
  }
});

// Save the updated data
fs.writeFileSync(foodsPath, JSON.stringify(foodsData, null, 2));

console.log(`\n✅ Successfully updated ${updatedCount} food images!`);

// Update the HighestVotedItems component
try {
  const highestVotedPath = path.join(process.cwd(), 'src', 'components', 'HighestVotedItems.jsx');
  let componentContent = fs.readFileSync(highestVotedPath, 'utf8');
  
  // Replace the default voting list image
  componentContent = componentContent.replace(
    "src={item.image || '/src/images/voting_list.png'}",
    `src={item.image || '${FOOD_IMAGE_URLS['voting_list']}'}`
  );
  
  fs.writeFileSync(highestVotedPath, componentContent);
  console.log('✅ Updated HighestVotedItems component with new image');
} catch (error) {
  console.error('Error updating HighestVotedItems component:', error.message);
}

console.log('\n🎉 Image update completed!');
console.log('Please restart your application to see the changes.');
