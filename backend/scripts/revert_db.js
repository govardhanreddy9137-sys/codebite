import mongoose from 'mongoose';
import 'dotenv/config';
import Food from '../src/models/Food.js';
import Restaurant from '../src/models/Restaurant.js';
import Order from '../src/models/Order.js';

// Hardcoded initial data from seed.js logic
const initialFoods = [
  { 
    id: 101, 
    restaurant: 'Amma Chetti Vanta', 
    category: 'tiffens', 
    name: 'sambar Idli (4 pcs)', 
    price: 60, 
    description: 'Soft idli with chutney & sambar.', 
    image: '/src/images/Idli Sambar.webp'
  },
  { 
    id: 102, 
    restaurant: 'Amma Chetti Vanta', 
    category: 'tiffens', 
    name: 'Masala Dosa', 
    price: 85, 
    description: 'Crispy dosa with potato masala.', 
    image: 'src/images/OIP.webp' 
  },
  { 
    id: 103, 
    restaurant: 'Amma Chetti Vanta', 
    category: 'veg', 
    name: 'Tomato Pappu + Rice', 
    price: 120, 
    description: 'Andhra tomato dal with rice.', 
    image: 'src/images/tomato pappu.jpg' 
  },
  { 
    id: 104, 
    restaurant: 'Amma Chetti Vanta', 
    category: 'nonveg', 
    name: 'Chicken Curry + Rice', 
    price: 190, 
    description: 'Home-style chicken curry.', 
    image: 'src/images/Chicken Curry + Rice.webp' 
  },
  { 
    id: 201, 
    restaurant: 'Andhra Meals', 
    category: 'veg', 
    name: 'Veg Meals', 
    price: 190, 
    description: 'Rice + sambar + curry + curd + pickle.', 
    image: 'src/images/chicken biryani.webp' 
  },
  { 
    id: 202, 
    restaurant: 'Andhra Meals', 
    category: 'nonveg', 
    name: 'Chicken Fry Piece Biryani', 
    price: 199, 
    description: 'Biryani with chicken fry piece.', 
    image: 'src/images/masala dosa.jpg' 
  },
  { 
    id: 301, 
    restaurant: 'Home Made Food', 
    category: 'veg', 
    name: 'Dal Fry + Rice', 
    price: 140, 
    description: 'Comfort dal fry with rice.', 
    image: 'src/images/Butter Chicken.webp' 
  },
  { 
    id: 302, 
    restaurant: 'Home Made Food', 
    category: 'veg', 
    name: 'Aloo Curry + Chapati', 
    price: 130, 
    description: 'Aloo curry with chapati.', 
    image: 'src/images/Aloo Paratha.webp' 
  },
  { 
    id: 401, 
    restaurant: 'Kalpana House', 
    category: 'tiffens', 
    name: 'Punugulu', 
    price: 30, 
    description: 'Crispy punugulu with chutney.', 
    image: 'src/images/Filter Coffee.webp' 
  },
  { 
    id: 402, 
    restaurant: 'Kalpana House', 
    category: 'veg', 
    name: 'Paneer Butter Masala', 
    price: 190, 
    description: 'Creamy paneer curry with rice.', 
    image: 'src/images/veg meals.avif' 
  }
];

const initialRestaurants = [
    {
      name: 'Amma Chetti Vanta',
      image: '/src/images/Mutton Biryani.webp',
      rating: 4.2,
      cuisine: 'South Indian • Home Style',
      offer: 'Flat 10% off',
      isOpen: true,
      opensAt: '9:00 AM'
    },
    {
      name: 'Andhra Meals',
      image: '/src/images/Filter Coffee.webp',
      rating: 4.5,
      cuisine: 'Andhra • Spicy',
      offer: '20% Off',
      isOpen: true,
      opensAt: '12:00 PM'
    },
    {
      name: 'Kalpana House',
      image: '/src/images/veg meals.avif',
      rating: 3.8,
      cuisine: 'Tiffens • Snacks',
      offer: 'Buy 2 Get 1',
      isOpen: true,
      opensAt: '7:00 AM'
    },
    {
      name: 'Taste of Punjab',
      image: '/src/images/masala dosa.jpg',
      rating: 4.6,
      cuisine: 'Punjabi • Rich Curry',
      offer: '15% Off',
      isOpen: true,
      opensAt: '12:00 PM'
    },
    {
      name: 'Home Made Food',
      image: '/src/images/Butter Chicken.webp',
      rating: 4.3,
      cuisine: 'Comfort • Minimal Oil',
      offer: 'Daily specials',
      isOpen: true,
      opensAt: '8:00 AM'
    },
    {
      name: 'Ammama Garri Illu',
      image: '/src/images/masala dosa.jpg',
      rating: 4.8,
      cuisine: 'Traditional Andhra • Home Style',
      offer: 'Grandma\'s Special',
      isOpen: true,
      opensAt: '8:00 AM'
    }
];

const revertDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Reversion: Connected to MongoDB');

        // Clear existing "Elite" data
        await Food.deleteMany({});
        await Restaurant.deleteMany({});
        console.log('🧹 DATABASE_CLEARED: Removed all Elite items and premium restaurants.');

        // Re-seed with original items
        await Restaurant.insertMany(initialRestaurants);
        await Food.insertMany(initialFoods);
        console.log('🍱 RESTORATION_COMPLETE: Seeded 6 original restaurants and core menus.');

        mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error('❌ REVERSION_FAILURE:', err);
        process.exit(1);
    }
};

revertDB();
