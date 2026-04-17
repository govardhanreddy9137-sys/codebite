import mongoose from 'mongoose';
import Food from '../src/models/Food.js';

const updateToLocalImages = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/codebite');
    console.log('Connected to MongoDB');

    const foodImageMap = {
      101: '/uploads/foods/idli.jpg',
      102: '/uploads/foods/masala-dosa.jpg',
      103: '/uploads/foods/tomato-pappu.jpg',
      104: '/uploads/foods/chicken-curry.jpg',
      201: '/uploads/foods/veg-meals.jpg',
      202: '/uploads/foods/chicken-biryani.jpg',
      301: '/uploads/foods/dal-fry.jpg',
      302: '/uploads/foods/aloo-curry.jpg',
      303: '/uploads/foods/upma.jpg',
      304: '/uploads/foods/egg-curry.jpg',
      401: '/uploads/foods/punugulu.jpg',
      402: '/uploads/foods/paneer-butter-masala.jpg',
      403: '/uploads/foods/curd-rice.jpg',
      404: '/uploads/foods/chicken-65.jpg',
      501: '/uploads/foods/vada.jpg',
      502: '/uploads/foods/pulihora.jpg',
      504: '/uploads/foods/chicken-pulusu.jpg'
    };

    for (const [foodId, imagePath] of Object.entries(foodImageMap)) {
      await Food.findOneAndUpdate(
        { id: parseInt(foodId) },
        { image: imagePath }
      );
      console.log(`✅ Updated food ${foodId} to use local image: ${imagePath}`);
    }

    console.log('✅ All foods updated to use local images!');
    console.log('📁 Make sure to place your image files in: backend/uploads/foods/');
    console.log('📁 Required files:', Object.values(foodImageMap).map(path => path.split('/').pop()));
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

updateToLocalImages();
