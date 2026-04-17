import mongoose from 'mongoose';
import Food from '../src/models/Food.js';

const updateToPCImages = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/codebite');
    console.log('Connected to MongoDB');

    // Update all foods to use simple image paths
    const pcImageMap = {
      101: '/images/idli.jpg',
      102: '/images/masala-dosa.jpg',
      103: '/images/tomato-pappu.jpg',
      104: '/images/chicken-curry.jpg',
      201: '/images/veg-meals.jpg',
      202: '/images/chicken-biryani.jpg',
      301: '/images/dal-fry.jpg',
      302: '/images/aloo-curry.jpg',
      303: '/images/upma.jpg',
      304: '/images/egg-curry.jpg',
      401: '/images/punugulu.jpg',
      402: '/images/paneer-butter-masala.jpg',
      403: '/images/curd-rice.jpg',
      404: '/images/chicken-65.jpg',
      501: '/images/vada.jpg',
      502: '/images/pulihora.jpg',
      504: '/images/chicken-pulusu.jpg'
    };

    for (const [foodId, imagePath] of Object.entries(pcImageMap)) {
      await Food.findOneAndUpdate(
        { id: parseInt(foodId) },
        { image: imagePath }
      );
      console.log(`✅ Updated food ${foodId}: ${imagePath}`);
    }

    console.log('\n🎉 SUCCESS! All foods updated to use local PC images');
    console.log('📁 Place your images in: backend/public/images/');
    console.log('📸 Required files:');
    Object.values(pcImageMap).forEach(path => {
      console.log(`   - ${path.split('/').pop()}`);
    });
    console.log('\n🌐 Images will be accessible at: http://localhost:3002/images/filename.jpg');
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

updateToPCImages();
