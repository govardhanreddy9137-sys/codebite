import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../src/models/User.js';

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codebite');

const createAmmaPicklesMerchant = async () => {
  try {
    console.log('🏪 Creating Amma Pickles merchant account...');
    
    // Check if Amma Pickles merchant already exists
    const existingMerchant = await User.findOne({ email: 'amma@pickles.com' });
    
    if (existingMerchant) {
      console.log('✅ Amma Pickles merchant already exists!');
      console.log(`📧 Email: amma@pickles.com`);
      console.log(`🔑 Password: amma123`);
      console.log(`🏪 Restaurant: Amma Pickles`);
      return;
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash('amma123', 10);
    
    // Create Amma Pickles merchant user
    const ammaMerchant = new User({
      name: 'Amma Pickles',
      email: 'amma@pickles.com',
      password: hashedPassword,
      role: 'merchant',
      restaurantName: 'Amma Pickles',
      phone: '9876543210',
      address: '123 Pickle Street, Andhra Pradesh, India',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    await ammaMerchant.save();
    
    console.log('✅ Amma Pickles merchant created successfully!');
    console.log('');
    console.log('📋 Login Credentials:');
    console.log('📧 Email: amma@pickles.com');
    console.log('🔑 Password: amma123');
    console.log('🏪 Restaurant: Amma Pickles');
    console.log('');
    console.log('🌐 You can now login as merchant and manage all pickle items!');
    
  } catch (error) {
    console.error('❌ Error creating Amma Pickles merchant:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the function
createAmmaPicklesMerchant();
