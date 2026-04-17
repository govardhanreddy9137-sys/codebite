import mongoose from 'mongoose';

const foodSchema = new mongoose.Schema({
  id: { type: Number },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  aiDescription: { type: String },
  image: { type: String },
  restaurant: { type: String, required: true },
  category: { type: String, enum: ['veg', 'nonveg', 'tiffens', 'tiffins', 'drinks', 'shakes', 'tea'], required: true },
  calories: { type: Number, default: 0 },
  protein: { type: Number, default: 0 },
  carbs: { type: Number, default: 0 },
  stock: { type: Number, default: 50 },
  isAvailable: { type: Boolean, default: true },
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model('Food', foodSchema);
