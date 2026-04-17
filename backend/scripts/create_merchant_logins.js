import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../src/models/User.js';
import Restaurant from '../src/models/Restaurant.js';

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codebite');

const createMerchantLogins = async () => {
  try {
    console.log('🏪 Creating merchant logins for all restaurants...\n');
    
    // Get all restaurants
    const restaurants = await Restaurant.find();
    console.log(`📊 Found ${restaurants.length} restaurants\n`);
    
    const password = '123456';
    const hashedPassword = await bcrypt.hash(password, 10);
    const createdMerchants = [];
    const existingMerchants = [];
    
    for (const restaurant of restaurants) {
      // Create email from restaurant name
      const emailPrefix = restaurant.name.toLowerCase().replace(/\s+/g, '');
      const email = `${emailPrefix}@gmail.com`;
      
      // Check if merchant already exists
      const existingMerchant = await User.findOne({ email });
      
      if (existingMerchant) {
        console.log(`ℹ️ Merchant already exists: ${restaurant.name} (${email})`);
        existingMerchants.push({
          name: restaurant.name,
          email: email,
          restaurant: restaurant.name
        });
        
        // Update password to 123456
        existingMerchant.password = hashedPassword;
        await existingMerchant.save();
        continue;
      }
      
      // Create new merchant user
      const merchant = new User({
        name: restaurant.name,
        email: email,
        password: hashedPassword,
        role: 'merchant',
        restaurantName: restaurant.name,
        phone: '9876543210',
        address: restaurant.location || 'Main Street, City',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      await merchant.save();
      
      console.log(`✅ Created merchant: ${restaurant.name}`);
      console.log(`   📧 Email: ${email}`);
      console.log(`   🔑 Password: ${password}`);
      console.log(`   🏪 Restaurant: ${restaurant.name}`);
      console.log('');
      
      createdMerchants.push({
        name: restaurant.name,
        email: email,
        restaurant: restaurant.name
      });
    }
    
    console.log('\n📊 Summary:');
    console.log(`✅ New merchants created: ${createdMerchants.length}`);
    console.log(`ℹ️ Existing merchants updated: ${existingMerchants.length}`);
    console.log(`🔑 Password for ALL merchants: ${password}`);
    
    console.log('\n🏪 MERCHANT LOGIN CREDENTIALS:');
    console.log('=====================================');
    
    const allMerchants = await User.find({ role: 'merchant' });
    
    allMerchants.forEach((merchant, index) => {
      console.log(`${index + 1}. 🏪 ${merchant.name}`);
      console.log(`   📧 Email: ${merchant.email}`);
      console.log(`   🔑 Password: ${password}`);
      console.log(`   🍽️ Restaurant: ${merchant.restaurantName}`);
      console.log('');
    });
    
    console.log(`\n🎉 All merchant logins created/updated successfully!`);
    console.log(`🔑 Default password for ALL merchants: ${password}`);
    
  } catch (error) {
    console.error('❌ Error creating merchant logins:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the function
createMerchantLogins();
