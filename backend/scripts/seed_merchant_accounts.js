import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../src/models/User.js';

const seedMerchantAccounts = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/codebite';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    const merchantsToSeed = [
      {
        email: 'ammachetivanta@gmail.com',
        password: 'password123',
        name: 'Amma Chetti Vanta',
        role: 'merchant',
        restaurantName: 'Amma Chetti Vanta'
      },
      {
        email: 'kalapanahouse@gmail.com',
        password: 'password123',
        name: 'Kalpana House',
        role: 'merchant',
        restaurantName: 'Kalpana House'
      },
      {
        email: 'ammamagarriillu@gmail.com',
        password: 'password123',
        name: 'Ammama Garri Illu',
        role: 'merchant',
        restaurantName: 'Ammama Garri Illu'
      },
      {
        email: 'tasteofpunjab@gmail.com',
        password: 'password123',
        name: 'Taste of Punjab',
        role: 'merchant',
        restaurantName: 'Taste of Punjab'
      },
      {
        email: 'andhrameals@gmail.com',
        password: 'password123',
        name: 'Andhra Meals',
        role: 'merchant',
        restaurantName: 'Andhra Meals'
      },
      {
        email: 'homemadefood@gmail.com',
        password: 'password123',
        name: 'Home Made Food',
        role: 'merchant',
        restaurantName: 'Home Made Food'
      }
    ];

    for (const data of merchantsToSeed) {
      await User.deleteOne({ email: data.email }); // Clean existing
      const newUser = new User(data);
      await newUser.save();
      console.log(`✅ Seeded merchant: ${data.email} - ${data.restaurantName}`);
    }

    console.log('✅ Merchant account setup complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding merchant accounts', err);
    process.exit(1);
  }
};

seedMerchantAccounts();
