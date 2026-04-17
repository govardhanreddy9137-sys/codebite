import mongoose from 'mongoose';
import Poll from '../src/models/Poll.js';

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codebite');

const checkPolls = async () => {
  try {
    console.log('🔍 Checking polls in database...\n');
    
    const polls = await Poll.find();
    
    console.log(`📊 Found ${polls.length} polls:\n`);
    
    polls.forEach((poll, index) => {
      console.log(`${index + 1}. 🗳️ ${poll.name}`);
      console.log(`   💰 Price: ₹${poll.price}`);
      console.log(`   🗳️ Votes: ${poll.votes}`);
      console.log(`   🖼️ Image: ${poll.image || 'No image'}`);
      console.log(`   📝 Description: ${poll.description || 'No description'}`);
      console.log('');
    });
    
    if (polls.length === 0) {
      console.log('ℹ️ No polls found in database');
      console.log('📝 You may need to add some poll items first');
    }
    
  } catch (error) {
    console.error('❌ Error checking polls:', error);
  } finally {
    mongoose.connection.close();
  }
};

checkPolls();
