import mongoose from 'mongoose';
import Food from '../src/models/Food.js';

const checkFoods = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/codebite');
    console.log('Connected to MongoDB');

    const count = await Food.countDocuments();
    console.log('Total food items in database:', count);
    
    if (count > 0) {
      const items = await Food.find().limit(5);
      console.log('Sample items:');
      items.forEach(item => {
        console.log(`- ${item.name} (${item.restaurant}) - ₹${item.price}`);
      });
    } else {
      console.log('No food items found. Running seed...');
      
      // Run seed to add items
      const { seedFoods } = await import('../src/seed.js');
      await seedFoods();
      console.log('Seeding completed');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkFoods();
