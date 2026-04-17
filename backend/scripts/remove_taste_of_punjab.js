import mongoose from 'mongoose';
import Restaurant from '../src/models/Restaurant.js';

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codebite');

const removeTasteOfPunjab = async () => {
  try {
    console.log('🗑️ Removing Taste of Punjab restaurant...');
    
    const deletedRestaurant = await Restaurant.findOneAndDelete({ name: 'Taste of Punjab' });
    
    if (deletedRestaurant) {
      console.log('✅ Taste of Punjab removed successfully!');
      console.log(`📛 Removed: ${deletedRestaurant.name}`);
      console.log(`⭐ Rating: ${deletedRestaurant.rating}`);
    } else {
      console.log('ℹ️ Taste of Punjab not found in database');
    }
    
    // Show remaining restaurants
    const restaurants = await Restaurant.find();
    console.log(`\n📊 Remaining restaurants (${restaurants.length}):`);
    
    restaurants.forEach((restaurant, index) => {
      console.log(`${index + 1}. 📛 ${restaurant.name} (${restaurant.isOpen ? 'Open' : 'Closed'})`);
    });
    
  } catch (error) {
    console.error('❌ Error removing Taste of Punjab:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the function
removeTasteOfPunjab();
