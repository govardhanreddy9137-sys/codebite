import mongoose from 'mongoose';
import 'dotenv/config';

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/codebite';

const foodSchema = new mongoose.Schema({ name: String, restaurant: String });
const Food = mongoose.models.Food || mongoose.model('Food', foodSchema);

const restaurantSchema = new mongoose.Schema({ name: String });
const Restaurant = mongoose.models.Restaurant || mongoose.model('Restaurant', restaurantSchema);

const allowedRestaurants = [
    'Amma Chetti Vanta',
    'Andhra Meals',
    'Kalpana House',
    'Home Made Food',
    'Ammama Garri Illu',
    'Hotel Taj Palace',
    'Taste of Punjab'
];

async function run() {
    try {
        await mongoose.connect(uri);
        console.log('Connected to DB');
        
        const removedRests = await Restaurant.deleteMany({ name: { $nin: allowedRestaurants } });
        console.log(`Deleted ${removedRests.deletedCount} unwanted restaurants.`);
        
        const removedFoods = await Food.deleteMany({ restaurant: { $nin: allowedRestaurants } });
        console.log(`Deleted ${removedFoods.deletedCount} food items from unwanted restaurants.`);
        
    } catch (e) {
        console.error(e);
    } finally {
        mongoose.disconnect();
    }
}
run();
