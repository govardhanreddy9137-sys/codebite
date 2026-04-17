import mongoose from 'mongoose';
import Food from '../src/models/Food.js';

const updateFoodImages = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/codebite');
    console.log('Connected to MongoDB');

    // Update Masala Dosa image
    await Food.findOneAndUpdate(
      { id: 102 },
      { 
        image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bWFzYWxhJTIwZG9zYXxlbnwwfHwwfHx8MA%3D%3D' 
      }
    );
    
    console.log('✅ Updated Masala Dosa image in database');
    
    // You can add more updates here
    // await Food.findOneAndUpdate({ id: 103 }, { image: 'NEW_IMAGE_URL' });
    
    console.log('All food images updated successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

updateFoodImages();
