import mongoose from 'mongoose';
import '../src/models/Order.js';
import 'dotenv/config';

const fix = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const Order = mongoose.model('Order');
        await Order.findByIdAndUpdate('69ae4ed38e70e3acebebfe49', {
            $unset: { riderId: 1 },
            $set: { 'rider.name': 'Assigning...', status: 'ready' }
        });
        console.log('Order reset successfully');
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};
fix();
