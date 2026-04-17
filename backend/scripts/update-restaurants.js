import mongoose from 'mongoose';
import Restaurant from '../src/models/Restaurant.js';

const updateRestaurants = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/codebite');
    console.log('Connected to MongoDB');

    const newRestaurants = [
      {
        name: 'Biryani Paradise',
        image: 'https://images.unsplash.com/photo-1563379078-d8d938064ad4?q=80&w=800&auto=format&fit=crop',
        rating: 4.8,
        cuisine: 'Hyderabadi • Dum Biryani',
        offer: 'Free Delivery',
        isOpen: true,
        opensAt: '11:00 AM'
      },
      {
        name: 'Taste of Punjab',
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=800&auto=format&fit=crop',
        rating: 4.6,
        cuisine: 'Punjabi • Rich Curry',
        offer: '15% Off',
        isOpen: true,
        opensAt: '12:00 PM'
      }
    ];

    for (const restaurant of newRestaurants) {
      await Restaurant.findOneAndUpdate(
        { name: restaurant.name },
        { $set: restaurant },
        { upsert: true, new: true }
      );
      console.log(`✅ Added/Updated restaurant: ${restaurant.name}`);
    }

    console.log('✅ All restaurants updated successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

updateRestaurants();
