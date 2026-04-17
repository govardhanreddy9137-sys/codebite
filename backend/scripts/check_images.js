import mongoose from 'mongoose';
import 'dotenv/config';

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/codebite';

const foodSchema = new mongoose.Schema({ name: String, image: String, restaurant: String });
const Food = mongoose.models.Food || mongoose.model('Food', foodSchema);

const restaurantSchema = new mongoose.Schema({ name: String, image: String });
const Restaurant = mongoose.models.Restaurant || mongoose.model('Restaurant', restaurantSchema);

async function run() {
    await mongoose.connect(uri);
    console.log('Connected to DB');

    const rests = await Restaurant.find().select('name image -_id').lean();
    console.log('\n--- Restaurants ---');
    rests.slice(0, 5).forEach(r => console.log(`${r.name}: ${r.image}`));

    const foods = await Food.find().select('name image restaurant -_id').lean();
    console.log('\n--- Foods ---');
    foods.slice(0, 5).forEach(f => console.log(`${f.name} (${f.restaurant}): ${f.image}`));
    
    // Check specific ones
    const masalaDosa = foods.find(f => f.name.includes('Masala Dosa'));
    console.log(`\nMasala Dosa Image:`, masalaDosa ? masalaDosa.image : 'Not found');

    const bp = rests.find(r => r.name.includes('Biryani Paradise'));
    console.log(`Biryani Paradise Image:`, bp ? bp.image : 'Not found');

    mongoose.disconnect();
}
run();
