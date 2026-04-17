import mongoose from 'mongoose';
import Food from '../src/models/Food.js';

const updateUserImages = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/codebite');
    console.log('Connected to MongoDB');

    const userImageMap = {
      101: 'src/images/OIP.webp',
      102: 'src/images/OIP.webp',
      103: 'src/images/tomato pappu.jpg',
      104: 'src/images/Chicken Curry + Rice.webp'
    };

    for (const [foodId, imagePath] of Object.entries(userImageMap)) {
      await Food.findOneAndUpdate(
        { id: parseInt(foodId) },
        { image: imagePath }
      );
      console.log(`✅ Updated food ${foodId} to use: ${imagePath}`);
    }

    console.log('✅ All user images updated!');
    console.log('📁 Images should be in: backend/src/images/');
    console.log('🌐 Accessible at: http://localhost:3002/src/images/filename.jpg');
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

updateUserImages();
