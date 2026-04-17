import mongoose from 'mongoose';
import Restaurant from '../src/models/Restaurant.js';

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codebite');

const addAmmaPicklesRestaurant = async () => {
  try {
    console.log('🏪 Adding Amma Pickles restaurant to the system...');
    
    // Check if Amma Pickles restaurant already exists
    const existingRestaurant = await Restaurant.findOne({ name: 'Amma Pickles' });
    
    if (existingRestaurant) {
      console.log('✅ Amma Pickles restaurant already exists!');
      console.log(`📛 Name: ${existingRestaurant.name}`);
      console.log(`📍 Location: ${existingRestaurant.location}`);
      console.log(`🟢 Status: ${existingRestaurant.isOpen ? 'Open' : 'Closed'}`);
      
      // Ensure it's open
      if (!existingRestaurant.isOpen) {
        await Restaurant.updateOne({ name: 'Amma Pickles' }, { isOpen: true });
        console.log('🟢 Updated Amma Pickles to Open status');
      }
      return;
    }
    
    // Create Amma Pickles restaurant
    const ammaPickles = new Restaurant({
      name: 'Amma Pickles',
      location: 'Andhra Pradesh, India',
      cuisine: 'Andhra Pickles & Traditional Foods',
      rating: 4.8,
      image: '/Avakaya.jpg', // Use the Avakaya pickle image
      isOpen: true,
      description: 'Authentic Andhra pickles and traditional foods made with love',
      deliveryTime: '30-45 mins',
      minOrder: 100,
      deliveryFee: 30,
      specialties: ['Avakaya Pickle', 'Gongura Pickle', 'Tomato Pickle', 'Chicken Pickle'],
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    await ammaPickles.save();
    
    console.log('✅ Amma Pickles restaurant created successfully!');
    console.log('');
    console.log('📋 Restaurant Details:');
    console.log(`📛 Name: ${ammaPickles.name}`);
    console.log(`📍 Location: ${ammaPickles.location}`);
    console.log(`🍽️ Cuisine: ${ammaPickles.cuisine}`);
    console.log(`⭐ Rating: ${ammaPickles.rating}`);
    console.log(`🟢 Status: ${ammaPickles.isOpen ? 'Open' : 'Closed'}`);
    console.log(`🚚 Delivery: ${ammaPickles.deliveryTime}`);
    console.log(`💰 Min Order: ₹${ammaPickles.minOrder}`);
    console.log('');
    console.log('🌐 Amma Pickles will now be visible in the restaurant filter!');
    
  } catch (error) {
    console.error('❌ Error adding Amma Pickles restaurant:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the function
addAmmaPicklesRestaurant();
