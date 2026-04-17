import mongoose from 'mongoose';
import Food from '../src/models/Food.js';

const updateIdliPhoto = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/codebite');
    console.log('Connected to MongoDB');

    // Update Idli photo
    await Food.findOneAndUpdate(
      { id: 101 },
      { 
        image: 'https://media.istockphoto.com/id/182456644/photo/idli-sambhar-and-chutney-south-indian-dish-on-banana-leaf.webp?a=1&b=1&s=612x612&w=0&k=20&c=-z5AXW3kQ68dhSZ8xEt0sCUcMuRATJhX0d5xJGAbRqs='
      }
    );
    
    console.log('✅ Updated Idli photo in database');
    console.log('🍽️ New photo: Idli with sambar and chutney on banana leaf');
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

updateIdliPhoto();
