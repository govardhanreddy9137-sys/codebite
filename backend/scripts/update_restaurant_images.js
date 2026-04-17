import mongoose from 'mongoose';
import 'dotenv/config';

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/codebite';

const restaurantSchema = new mongoose.Schema({ name: String, image: String });
const Restaurant = mongoose.models.Restaurant || mongoose.model('Restaurant', restaurantSchema);

const fixImages = async () => {
    await mongoose.connect(uri);

    const imagesFallback = [
        'src/images/veg meals.avif',
        'src/images/chicken biryani.webp',
        'src/images/masala dosa.jpg',
        'src/images/Butter Chicken.webp',
        'src/images/Aloo Paratha.webp',
        'src/images/Idli Sambar.webp',
        'src/images/Mutton Biryani.webp',
        'src/images/Filter Coffee.webp'
    ];

    const rests = await Restaurant.find();
    
    for (let i = 0; i < rests.length; i++) {
        // Assign a random local image if it has an unsplash link
        if (rests[i].image && rests[i].image.includes('unsplash')) {
            const fallback = imagesFallback[i % imagesFallback.length];
            rests[i].image = fallback;
            await rests[i].save();
            console.log(`Updated ${rests[i].name} to use ${fallback}`);
        }
    }

    console.log('Done fixing restaurant images');
    mongoose.disconnect();
};

fixImages();
