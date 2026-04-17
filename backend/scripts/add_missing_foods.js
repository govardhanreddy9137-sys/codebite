import mongoose from 'mongoose';
import 'dotenv/config';

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/codebite';

const foodSchema = new mongoose.Schema({
    id: Number,
    name: String,
    price: Number,
    description: String,
    image: String,
    restaurant: String,
    category: String,
    calories: Number,
    protein: Number,
    carbs: Number
});

const Food = mongoose.models.Food || mongoose.model('Food', foodSchema);

const missingFoods = [
    // Kalpana House (Tiffens / Snacks)
    { id: 1001, name: 'Samosa Chat', price: 60, description: 'Crispy samosa with tangy chutneys.', image: 'src/images/Aloo Tikki.webp', restaurant: 'Kalpana House', category: 'tiffens', calories: 350 },
    { id: 1002, name: 'Pani Puri', price: 50, description: 'Spicy water balls filled with potatoes.', image: 'src/images/Poha.webp', restaurant: 'Kalpana House', category: 'tiffens', calories: 200 },
    { id: 1003, name: 'Masala Vada', price: 40, description: 'Crispy lentil fritters.', image: 'src/images/Medu Vada.webp', restaurant: 'Kalpana House', category: 'tiffens', calories: 280 },
    
    // Home Made Food (Comfort)
    { id: 1004, name: 'Phulka Combo', price: 90, description: '3 soft phulkas with dal and sabzi.', image: 'src/images/PULKA.webp', restaurant: 'Home Made Food', category: 'veg', calories: 400 },
    { id: 1005, name: 'Curd Rice', price: 80, description: 'Cooling curd rice with pickle.', image: 'src/images/Curd Rice.webp', restaurant: 'Home Made Food', category: 'veg', calories: 300 },
    { id: 1006, name: 'Khichdi', price: 100, description: 'Comforting lentil and rice mix.', image: 'src/images/Pongal.webp', restaurant: 'Home Made Food', category: 'veg', calories: 350 },
    
    // Hotel Taj Palace (Mughlai)
    { id: 1007, name: 'Mutton Curry', price: 350, description: 'Rich and spicy mutton gravy.', image: 'src/images/Rogan Josh.webp', restaurant: 'Hotel Taj Palace', category: 'nonveg', calories: 550 },
    { id: 1008, name: 'Fish Tikka', price: 320, description: 'Tandoori roasted fish fillets.', image: 'src/images/fish fry.webp', restaurant: 'Hotel Taj Palace', category: 'nonveg', calories: 400 },
    { id: 1009, name: 'Butter Naan', price: 50, description: 'Soft naan brushed with butter.', image: 'src/images/Garlic Naan.webp', restaurant: 'Hotel Taj Palace', category: 'veg', calories: 220 },
    
    // Biryani Zone (North Indian / Kebab)
    { id: 1010, name: 'Chicken Tikka', price: 220, description: 'Spicy roasted chicken chunks.', image: 'src/images/Tandoori Chicken.webp', restaurant: 'Biryani Zone', category: 'nonveg', calories: 450 },
    { id: 1011, name: 'Mutton Biryani', price: 300, description: 'Aromatic dum cooked mutton biryani.', image: 'src/images/Mutton Biryani.webp', restaurant: 'Biryani Zone', category: 'nonveg', calories: 650 },
    { id: 1012, name: 'Special Chicken Biryani', price: 280, description: 'Signature biryani with extra spices.', image: 'src/images/chicken biryani.webp', restaurant: 'Biryani Zone', category: 'nonveg', calories: 600 }
];

async function run() {
    try {
        await mongoose.connect(uri);
        console.log('Connected to DB');
        
        let added = 0;
        for (const food of missingFoods) {
            const exists = await Food.findOne({ name: food.name, restaurant: food.restaurant });
            if (!exists) {
                await new Food(food).save();
                console.log(`Added ${food.name} to ${food.restaurant}`);
                added++;
            }
        }
        
        console.log(`\nSuccessfully added ${added} new menu items! All restaurants are now functional.`);
    } catch (e) {
        console.error(e);
    } finally {
        mongoose.disconnect();
    }
}

run();
