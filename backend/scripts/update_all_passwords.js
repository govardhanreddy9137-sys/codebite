import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../src/models/User.js';

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codebite');

const updateAllPasswords = async () => {
  try {
    console.log('🔑 Updating all passwords to 123456...\n');
    
    const users = await User.find();
    const newPassword = '123456';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    console.log(`📊 Found ${users.length} users to update\n`);
    
    for (const user of users) {
      const oldRole = user.role;
      
      // Update password
      user.password = hashedPassword;
      
      // Set govardhan@gmail.com as admin
      if (user.email === 'govardhan@gmail.com') {
        user.role = 'admin';
        console.log(`👑 ${user.name} (${user.email}) → Role: admin, Password: 123456`);
      } else if (user.role === 'rider') {
        console.log(`🚚 ${user.name} (${user.email}) → Role: rider, Password: 123456`);
      } else if (user.role === 'merchant') {
        console.log(`🏪 ${user.name} (${user.email}) → Role: merchant, Password: 123456`);
      } else {
        console.log(`👤 ${user.name} (${user.email}) → Role: ${user.role}, Password: 123456`);
      }
      
      await user.save();
    }
    
    console.log('\n✅ All passwords updated successfully!');
    console.log('\n🔑 Updated Login Credentials:');
    console.log('=====================================');
    
    const updatedUsers = await User.find();
    
    updatedUsers.forEach(user => {
      let icon = '👤';
      if (user.role === 'admin') icon = '👑';
      else if (user.role === 'rider') icon = '🚚';
      else if (user.role === 'merchant') icon = '🏪';
      
      console.log(`${icon} ${user.name}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   🔑 Password: 123456`);
      console.log(`   🔑 Role: ${user.role}`);
      if (user.restaurantName) {
        console.log(`   🏪 Restaurant: ${user.restaurantName}`);
      }
      console.log('');
    });
    
    console.log('\n📊 Summary:');
    console.log(`Total users updated: ${updatedUsers.length}`);
    console.log(`Default password for ALL users: 123456`);
    
  } catch (error) {
    console.error('❌ Error updating passwords:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the function
updateAllPasswords();
