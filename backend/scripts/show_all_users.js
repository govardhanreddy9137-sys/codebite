import mongoose from 'mongoose';
import User from '../src/models/User.js';

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codebite');

const showAllUsers = async () => {
  try {
    console.log('👥 All User Login Credentials:');
    console.log('=====================================\n');
    
    const users = await User.find();
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. 👤 ${user.name}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   🔑 Password: ${user.email === user.password ? 'No password set' : '[Encrypted]'}`);
      console.log(`   🏪 Restaurant: ${user.restaurantName || 'N/A'}`);
      console.log(`   🔑 Role: ${user.role}`);
      console.log(`   📱 Phone: ${user.phone || 'N/A'}`);
      console.log(`   ✅ Status: ${user.isActive ? 'Active' : 'Inactive'}`);
      console.log(`   📅 Created: ${user.createdAt}`);
      console.log('');
    });
    
    console.log('\n📊 Summary:');
    console.log(`Total Users: ${users.length}`);
    
    const adminUsers = users.filter(u => u.role === 'admin');
    const merchantUsers = users.filter(u => u.role === 'merchant');
    const customerUsers = users.filter(u => u.role === 'customer');
    
    console.log(`Admin Users: ${adminUsers.length}`);
    console.log(`Merchant Users: ${merchantUsers.length}`);
    console.log(`Customer Users: ${customerUsers.length}`);
    
    console.log('\n🔑 Default Login Credentials:');
    console.log('=====================================');
    
    // Show default credentials
    users.forEach(user => {
      if (user.email.includes('admin') || user.email.includes('merchant')) {
        console.log(`\n👤 ${user.name} (${user.role.toUpperCase()})`);
        console.log(`📧 Email: ${user.email}`);
        
        // Show actual password for known accounts
        if (user.email === 'admin@codebite.com') {
          console.log('🔑 Password: admin123');
        } else if (user.email === 'amma@pickles.com') {
          console.log('🔑 Password: amma123');
        } else if (user.email.includes('test')) {
          console.log('🔑 Password: test123');
        } else {
          console.log('🔑 Password: [Check database or reset]');
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching users:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the function
showAllUsers();
