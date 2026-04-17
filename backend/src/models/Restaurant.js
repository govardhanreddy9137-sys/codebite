import mongoose from 'mongoose';

const restaurantSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    isOpen: { type: Boolean, default: true },
    opensAt: { type: String, default: '9:00 AM' },
    image: { type: String },
    rating: { type: Number, default: 4.0 },
    cuisine: { type: String },
    offer: { type: String }
}, { timestamps: true });

export default mongoose.model('Restaurant', restaurantSchema);
