import mongoose from 'mongoose';
import Restaurant from '../src/models/Restaurant.js';

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codebite');

const checkRestaurants = async () => {
  try {
    console.log('🔍 Checking all restaurants in the database...');
    
    const restaurants = await Restaurant.find();
    
    console.log(`\n📊 Found ${restaurants.length} restaurants:`);
    
    restaurants.forEach((restaurant, index) => {
      console.log(`\n${index + 1}. 📛 ${restaurant.name}`);
      console.log(`   📍 Location: ${restaurant.location || 'Not specified'}`);
      console.log(`   🍽️ Cuisine: ${restaurant.cuisine || 'Not specified'}`);
      console.log(`   ⭐ Rating: ${restaurant.rating || 'Not rated'}`);
      console.log(`   🟢 Status: ${restaurant.isOpen ? 'Open' : 'Closed'}`);
      console.log(`   🖼️ Image: ${restaurant.image || 'No image'}`);
    });
    
    // Check specifically for Amma Pickles
    const ammaPickles = restaurants.find(r => r.name === 'Amma Pickles');
    
    if (ammaPickles) {
      console.log(`\n✅ Amma Pickles found and accessible!`);
      console.log(`🟢 Status: ${ammaPickles.isOpen ? 'Open' : 'Closed'}`);
      console.log(`🖼️ Image: ${ammaPickles.image}`);
    } else {
      console.log(`\n❌ Amma Pickles not found in database!`);
    }
    
  } catch (error) {
    console.error('❌ Error checking restaurants:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the function
checkRestaurants();
