const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/codebite').then(async () => {
    try {
        const Order = require('../src/models/Order.js').default;
        
        console.log('--- raw driver ---');
        const coll = mongoose.connection.collection('orders');
        console.log('pending ones without riderId:', await coll.countDocuments({ status: { $in: ['pending', 'preparing', 'ready'] }, riderId: { $exists: false } }));
        
        console.log('--- mongoose ---');
        const orders1 = await Order.find({ 
            status: { $in: ['pending', 'preparing', 'ready'] }, 
            riderId: { $exists: false } 
        });
        console.log('.find() with $exists:false count:', orders1.length);
        
        const orders2 = await Order.find({ 
            status: { $in: ['pending', 'preparing', 'ready'] }, 
            riderId: null
        });
        console.log('.find() with null count:', orders2.length);

        console.log('All pending statuses:', await Order.find({ status: 'pending' }).countDocuments());
        
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
});
