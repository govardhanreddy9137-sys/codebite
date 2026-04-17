import mongoose from 'mongoose';
import Poll from '../src/models/Poll.js';

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codebite');

const fixPollImages = async () => {
  try {
    console.log('🔧 Fixing poll image paths...\n');
    
    const polls = await Poll.find();
    let updatedCount = 0;
    
    for (const poll of polls) {
      const oldImage = poll.image;
      let newImage = oldImage;
      
      // Fix paths that start with src/images/ or /src/images/
      if (oldImage && (oldImage.startsWith('src/images/') || oldImage.startsWith('/src/images/'))) {
        newImage = oldImage.replace(/^\/?src\/images\//, '/images/');
        poll.image = newImage;
        await poll.save();
        updatedCount++;
        console.log(`✅ Updated: ${poll.name}`);
        console.log(`   Old: ${oldImage}`);
        console.log(`   New: ${newImage}`);
        console.log('');
      }
    }
    
    console.log(`📊 Summary: ${updatedCount} polls updated`);
    
    if (updatedCount === 0) {
      console.log('ℹ️ No polls needed updating');
    }
    
    // Show all polls with their images
    const updatedPolls = await Poll.find();
    console.log('\n📋 All Polls:');
    updatedPolls.forEach((poll, index) => {
      console.log(`${index + 1}. ${poll.name} - ${poll.image || 'No image'}`);
    });
    
  } catch (error) {
    console.error('❌ Error fixing poll images:', error);
  } finally {
    mongoose.connection.close();
  }
};

fixPollImages();
