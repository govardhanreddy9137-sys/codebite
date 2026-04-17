import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import Food from '../src/models/Food.js';
import Restaurant from '../src/models/Restaurant.js';
import User from '../src/models/User.js';

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codebite');

const removeAllPickles = async () => {
  try {
    console.log('🗑️ Removing all pickle items and Amma Pickles...');
    
    // Read current foods data
    const foodsPath = path.join(process.cwd(), 'foods_utf8.json');
    let foodsData = JSON.parse(fs.readFileSync(foodsPath, 'utf8'));
    
    // Filter out all pickle items
    const originalCount = foodsData.value.length;
    const pickleItems = foodsData.value.filter(food => 
      food.name.toLowerCase().includes('pickle')
    );
    
    console.log(`\n🥒 Found ${pickleItems.length} pickle items to remove:`);
    pickleItems.forEach(item => {
      console.log(`   🗑️ ${item.name} (${item.restaurant})`);
    });
    
    // Remove pickle items from data
    foodsData.value = foodsData.value.filter(food => 
      !food.name.toLowerCase().includes('pickle')
    );
    
    // Save updated foods data
    fs.writeFileSync(foodsPath, JSON.stringify(foodsData, null, 2));
    
    console.log(`\n📊 Foods Summary:`);
    console.log(`   Original: ${originalCount} items`);
    console.log(`   Removed: ${pickleItems.length} pickle items`);
    console.log(`   Remaining: ${foodsData.value.length} items`);
    
    // Remove Amma Pickles restaurant
    const deletedRestaurant = await Restaurant.findOneAndDelete({ name: 'Amma Pickles' });
    
    if (deletedRestaurant) {
      console.log(`\n🏪 Removed Amma Pickles restaurant:`);
      console.log(`   📛 Name: ${deletedRestaurant.name}`);
      console.log(`   🍽️ Cuisine: ${deletedRestaurant.cuisine}`);
      console.log(`   ⭐ Rating: ${deletedRestaurant.rating}`);
    } else {
      console.log(`\nℹ️ Amma Pickles restaurant not found in database`);
    }
    
    // Remove Amma Pickles merchant account
    const deletedMerchant = await User.findOneAndDelete({ email: 'amma@pickles.com' });
    
    if (deletedMerchant) {
      console.log(`\n👤 Removed Amma Pickles merchant account:`);
      console.log(`   📧 Email: ${deletedMerchant.email}`);
      console.log(`   👤 Name: ${deletedMerchant.name}`);
      console.log(`   🏪 Restaurant: ${deletedMerchant.restaurantName}`);
      console.log(`   🔑 Role: ${deletedMerchant.role}`);
    } else {
      console.log(`\nℹ️ Amma Pickles merchant account not found`);
    }
    
    // Show remaining restaurants
    const restaurants = await Restaurant.find();
    console.log(`\n📊 Remaining restaurants (${restaurants.length}):`);
    
    restaurants.forEach((restaurant, index) => {
      console.log(`${index + 1}. 📛 ${restaurant.name} (${restaurant.isOpen ? 'Open' : 'Closed'})`);
    });
    
    console.log(`\n🎉 All pickles, Amma Pickles restaurant, and merchant account removed!`);
    
  } catch (error) {
    console.error('❌ Error removing pickles:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the function
removeAllPickles();
