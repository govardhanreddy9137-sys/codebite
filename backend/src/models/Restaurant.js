import mongoose from 'mongoose';

const restaurantSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    isOpen: { type: Boolean, default: true },
    opensAt: { type: String, default: '9:00 AM' },
    image: { type: String },
    rating: { type: Number, default: 4.0 },
    cuisine: { type: String },
    offer: { type: String },
    address: { type: String, default: 'Building 4, Sector 7' }
}, { timestamps: true });

export default mongoose.model('Restaurant', restaurantSchema);
