
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const FoodSchema = new mongoose.Schema({
  id: Number,
  name: String,
  price: Number,
  description: String,
  aiDescription: String,
  image: String,
  restaurant: String,
  category: { type: String, enum: ['veg', 'nonveg', 'tiffens', 'tiffins', 'drinks', 'shakes', 'tea'] },
  calories: Number,
  protein: Number,
  carbs: Number,
  stock: { type: Number, default: 50 },
  isAvailable: { type: Boolean, default: true }
}, { timestamps: true });

const Food = mongoose.model('Food', FoodSchema);

const pickleItems = [
  { id: 901, name: "Avakaya (Mango Pickle)", price: 80, description: "Authentic Andhra spicy mango pickle.", image: "src/images/gongura.webp", restaurant: "Amma Chetti Vanta", category: "veg", calories: 120, protein: 2 },
  { id: 902, name: "Tomato Pickle", price: 70, description: "Tangy and spicy homemade tomato pickle.", image: "src/images/tomato pappu.jpg", restaurant: "Home Made Food", category: "veg", calories: 110, protein: 2 },
  { id: 903, name: "Nimakaya (Lemon Pickle)", price: 60, description: "Zesty lemon pickle with traditional spices.", image: "src/images/Lemon Tea.webp", restaurant: "Amma Chetti Vanta", category: "veg", calories: 95, protein: 1 },
  { id: 904, name: "Gongura Pickle", price: 85, description: "Special sorrel leaf pickle - a spicy favorite.", image: "src/images/gongura.webp", restaurant: "Andhra Meals", category: "veg", calories: 130, protein: 3 },
  { id: 905, name: "Ginger Pickle (Allam)", price: 75, description: "Fiery ginger pickle with a sweet touch.", image: "src/images/Ginger Tea.webp", restaurant: "Amma Chetti Vanta", category: "veg", calories: 140, protein: 2 },
  { id: 906, name: "Mixed Vegetable Pickle", price: 90, description: "Colorful medley of vegetables in spicy oil.", image: "src/images/veg meals.avif", restaurant: "Home Made Food", category: "veg", calories: 120, protein: 3 },
  { id: 907, name: "Andhra Chicken Pickle", price: 199, description: "Slow-roasted chicken pieces in spicy pickle masala.", image: "src/images/chicken 65.webp", restaurant: "Biryani Paradise", category: "nonveg", calories: 350, protein: 18 },
  { id: 908, name: "Spicy Mutton Pickle", price: 299, description: "Succulent mutton bits in authentic Guntur spice pickle.", image: "src/images/Mutton Biryani.webp", restaurant: "Biryani Paradise", category: "nonveg", calories: 420, protein: 22 },
  { id: 909, name: "Prawn Pickle (Royyala)", price: 250, description: "Fresh prawns preserved in spicy pickle marinade.", image: "src/images/prawn biryani.webp", restaurant: "Andhra Meals", category: "nonveg", calories: 280, protein: 19 },
  { id: 910, name: "Fish Pickle", price: 220, description: "Boneless fish chunks in traditional spiced oil.", image: "src/images/fish fry.webp", restaurant: "Biryani Zone", category: "nonveg", calories: 310, protein: 20 },
  { id: 911, name: "Egg Pickle", price: 150, description: "Boiled egg halves in a rich pickle reduction.", image: "src/images/Egg Biryani.webp", restaurant: "Home Made Food", category: "nonveg", calories: 260, protein: 14 },
  { id: 912, name: "Garlic Pickle (Vellulli)", price: 95, description: "Whole garlic cloves pickeld in spicy red chili oil.", image: "src/images/dal tadaka rice.webp", restaurant: "Taste of Punjab", category: "veg", calories: 180, protein: 4 }
];

async function addPickles() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected.');

    for (const item of pickleItems) {
      await Food.findOneAndUpdate({ id: item.id }, item, { upsert: true });
    }
    console.log('✅ Successfully added/updated pickles in MongoDB.');

    // Update JSON file
    const jsonPath = path.join(__dirname, '..', 'foods_utf8.json');
    if (fs.existsSync(jsonPath)) {
      const currentData = JSON.parse(fs.readFileSync(jsonPath, 'utf8').replace(/^\uFEFF/, ''));
      let foodsList = Array.isArray(currentData) ? currentData : (currentData.value || []);
      
      pickleItems.forEach(p => {
        if (!foodsList.some(f => f.id === p.id)) {
          foodsList.push({
            ...p,
            _id: new mongoose.Types.ObjectId().toString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
      });
      
      const newData = Array.isArray(currentData) ? foodsList : { ...currentData, value: foodsList };
      fs.writeFileSync(jsonPath, JSON.stringify(newData, null, 4), 'utf8');
      console.log('✅ Successfully appended pickles to foods_utf8.json.');
    }

    process.exit(0);
  } catch (err) {
    console.error('FAILED TO ADD PICKLES:');
    console.error(err);
    process.exit(1);
  }
}

addPickles();
