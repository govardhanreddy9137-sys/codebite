import mongoose from 'mongoose';
import '../src/models/Order.js';
import 'dotenv/config';

const check = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const Order = mongoose.model('Order');
        const orders = await Order.find({ status: { $in: ['pending', 'preparing', 'ready'] } });
        console.log(`Found ${orders.length} active orders`);
        if (orders.length > 0) {
            orders.forEach(o => console.log(`ID: ${o._id}, Status: ${o.status}`));
        }
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};
check();
