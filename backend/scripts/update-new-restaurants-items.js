import mongoose from 'mongoose';
import Food from '../src/models/Food.js';

const updateNewRestaurantItems = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/codebite');
    console.log('Connected to MongoDB');

    const newFoodItems = [
      // Biryani Paradise Items
      { 
        id: 601, 
        restaurant: 'Biryani Paradise', 
        category: 'nonveg', 
        name: 'Hyderabadi Dum Biryani', 
        price: 250, 
        description: 'Authentic Hyderabadi biryani with raita.', 
        aiDescription: 'Aromatic basmati rice layered with tender meat and exotic spices.',
        image: '/images/hyderabadi-biryani.jpg' 
      },
      { 
        id: 602, 
        restaurant: 'Biryani Paradise', 
        category: 'nonveg', 
        name: 'Chicken 65 Biryani', 
        price: 280, 
        description: 'Spicy Chicken 65 with biryani rice.', 
        aiDescription: 'Fusion of crispy Chicken 65 and fragrant biryani rice.',
        image: '/images/chicken65-biryani.jpg' 
      },
      { 
        id: 603, 
        restaurant: 'Biryani Paradise', 
        category: 'veg', 
        name: 'Veg Dum Biryani', 
        price: 220, 
        description: 'Mixed vegetables biryani with raita.', 
        aiDescription: 'Colorful medley of vegetables cooked in dum style with aromatic rice.',
        image: '/images/veg-biryani.jpg' 
      },
      { 
        id: 604, 
        restaurant: 'Biryani Paradise', 
        category: 'nonveg', 
        name: 'Mutton Biryani', 
        price: 320, 
        description: 'Traditional mutton dum biryani.', 
        aiDescription: 'Rich and tender mutton pieces slow-cooked with basmati rice.',
        image: '/images/mutton-biryani.jpg' 
      },
      // Taste of Punjab Items
      { 
        id: 701, 
        restaurant: 'Taste of Punjab', 
        category: 'nonveg', 
        name: 'Butter Chicken', 
        price: 280, 
        description: 'Creamy butter chicken with naan.', 
        aiDescription: 'Tender chicken in rich tomato-butter gravy with aromatic spices.',
        image: '/images/butter-chicken.jpg' 
      },
      { 
        id: 702, 
        restaurant: 'Taste of Punjab', 
        category: 'veg', 
        name: 'Paneer Butter Masala', 
        price: 240, 
        description: 'Creamy paneer curry with naan.', 
        aiDescription: 'Soft cottage cheese cubes in rich buttery tomato gravy.',
        image: '/images/paneer-butter-masala.jpg' 
      },
      { 
        id: 703, 
        restaurant: 'Taste of Punjab', 
        category: 'nonveg', 
        name: 'Dal Makhani', 
        price: 180, 
        description: 'Creamy black lentils with rice.', 
        aiDescription: 'Slow-cooked black lentils in rich buttery gravy.',
        image: '/images/dal-makhani.jpg' 
      },
      { 
        id: 704, 
        restaurant: 'Taste of Punjab', 
        category: 'veg', 
        name: 'Aloo Gobi', 
        price: 160, 
        description: 'Potato and cauliflower dry curry.', 
        aiDescription: 'Dry curry of potatoes and cauliflower with Punjabi spices.',
        image: '/images/aloo-gobi.jpg' 
      },
      { 
        id: 705, 
        restaurant: 'Taste of Punjab', 
        category: 'nonveg', 
        name: 'Chicken Tikka Masala', 
        price: 260, 
        description: 'Grilled chicken in creamy masala.', 
        aiDescription: 'Smoky grilled chicken chunks in rich creamy tomato gravy.',
        image: '/images/chicken-tikka-masala.jpg' 
      }
    ];

    for (const food of newFoodItems) {
      await Food.findOneAndUpdate(
        { id: food.id },
        food,
        { upsert: true, new: true }
      );
      console.log(`✅ Added/Updated: ${food.name} (${food.restaurant})`);
    }

    console.log('✅ All new restaurant items added successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

updateNewRestaurantItems();
