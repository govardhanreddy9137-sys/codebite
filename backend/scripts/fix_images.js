import mongoose from 'mongoose';
import 'dotenv/config';

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const restaurantMap = {
      'Burger Lab': '/src/images/burger.jpg',
      'Pizza Republic': '/src/images/OIP.webp',
      'Biryani House': '/src/images/Hyderabadi Biryani.webp',
      'Green Kitchen': '/src/images/veg meals.avif',
      'Sweet Spot': '/src/images/Rose Milk.webp',
      'Juice Junction': '/src/images/Mango Lassi.webp',
      'Amma Chetti Vanta': '/src/images/Idli Sambar.webp',
      'Andhra Meals': '/src/images/veg meals.avif',
      'Kalpana House': '/src/images/Punugulu.webp',
      'Biryani Paradise': '/src/images/Hyderabadi Dum Biryani.webp',
      'Taste of Punjab': '/src/images/Butter Chicken.webp',
      'Home Made Food': '/src/images/UPMA.webp',
      'Hotel Taj Palace': '/src/images/fish fry.webp',
      'Paradise Hotel': '/src/images/spl biryani.webp',
      'Hotel Swagath': '/src/images/Idli Sambar.webp',
      'Biryani Zone': '/src/images/chicken biryani.webp',
      'Srikanya': '/src/images/chicken biryani.webp',
      'Mehfil': '/src/images/Hyderabadi Biryani.webp'
    };

    const foodImageFiles = [
      'Aloo Curry + Chapati.webp', 'Aloo Gobi.webp', 'Aloo Paratha.webp', 'Aloo Tikki.webp', 
      'Amritsari Kulcha.webp', 'Appam with Stew.webp', 'Avial.webp', 'Badam Milk.webp', 
      'Banana Shake.webp', 'Butter Chicken.webp', 'CHAPATHI(1).webp', 'Chicken 65 Biryani.webp', 
      'Chicken Curry + Rice.webp', 'Chicken Manchurian.webp', 'Chicken Tikka Masala.webp', 
      'Chikoo Shake.webp', 'Chilli Paneer.webp', 'Chole Bhature.webp', 'Cold Coffee.webp', 
      'Curd Rice.webp', 'Dal Makhani.webp', 'Egg Biryani.webp', 'Egg Curry + Rice.webp', 
      'Filter Coffee.webp', 'Fish Curry.webp', 'Garlic Naan.webp', 'Ginger Tea.webp', 
      'Green Tea.webp', 'Hyderabadi Biryani.webp', 'Hyderabadi Dum Biryani.webp', 
      'Iced Tea.webp', 'Idli Sambar.webp', 'Kadai Chicken.webp', 'Keema Biryani.webp', 
      'Kerala Beef Fry.webp', 'Kerala Parotta.webp', 'Kootu Curry.webp', 'Lemon Tea.webp', 
      'Madras Coffee.webp', 'Malai Kofta.webp', 'Mango Lassi.webp', 'Masala Chai.webp', 
      'Medu Vada.webp', 'Meen Pollichathu.webp', 'Mutton Biryani.webp', 'OIP (1).webp', 
      'OIP.webp', 'Onion Pakora.webp', 'PULKA.webp', 'Palak Paneer.webp', 
      'Paneer Butter Masala 1.webp', 'Paneer Butter Masala.webp', 'Pindi Vantallu.webp', 
      'Poha.webp', 'Pongal.webp', 'Poori Bhaji.webp', 'Prawn Fry.webp', 'Punugulu.webp', 
      'Rasam Rice.webp', 'Rogan Josh.webp', 'Rose Milk.webp', 'Sambar Rice.webp', 
      'Sarson da Saag.webp', 'Spring Rolls.webp', 'Strawberry Shake.webp', 
      'Tandoori Chicken.webp', 'UPMA.webp', 'Uttapam.webp', 'Veg Biryani.webp', 
      'Veg Dum Biryani.webp', 'Veg Pakora.webp', 'Vegetable Kurma.webp', 'bajji.webp', 
      'chicken 65.webp', 'chicken biryani.webp', 'dal fry.webp', 'dal tadaka rice.webp', 
      'fish fry.webp', 'gongura.webp', 'masala dosa.jpg', 'panner.webp', 'peserattu.webp', 
      'prawn biryani.webp', 'pulihora.webp', 'spl biryani.webp', 'tomato pappu.jpg', 
      'veg meals.avif', 'wada 2pcs.webp'
    ];

    console.log('UPDATING RESTAURANTS...');
    for (const [name, image] of Object.entries(restaurantMap)) {
      await mongoose.connection.db.collection('restaurants').updateOne(
        { name: name },
        { $set: { image: image } }
      );
      console.log(`✅ Updated restaurant: ${name}`);
    }

    console.log('UPDATING FOODS...');
    const foods = await mongoose.connection.db.collection('foods').find({}).toArray();
    for (const food of foods) {
      // Try to find a matching image file
      const name = food.name.toLowerCase();
      let bestMatch = null;

      // Simple matching
      for (const file of foodImageFiles) {
        const fileNameBase = file.split('.')[0].toLowerCase();
        if (name.includes(fileNameBase) || fileNameBase.includes(name)) {
          bestMatch = `/src/images/${file}`;
          break;
        }
      }

      if (bestMatch) {
        await mongoose.connection.db.collection('foods').updateOne(
          { _id: food._id },
          { $set: { image: bestMatch } }
        );
        console.log(`✅ Updated food: ${food.name} -> ${bestMatch}`);
      }
    }

    console.log('✨ All images updated successfully!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
