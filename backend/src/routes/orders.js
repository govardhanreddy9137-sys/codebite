import express from 'express';
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import { verifyToken } from '../utils/jwt.js';
// SSE removed

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ ok: true, message: 'Orders route reachable' });
});

router.get('/', verifyToken, async (req, res) => {
  try {
    console.log('=== ORDERS GET REQUEST ===');
    console.log('User from token:', req.user);
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'User context missing' });
    }

    let query = {};
    // Admins see everything, Riders/Merchants handled by specific routes, 
    // Customers see only their own.
    if (req.user.role === 'user') {
      query = { userId: req.user.id };
    }
    
    console.log('Running Order.find with query:', query);
    const orders = await Order.find(query).sort({ createdAt: -1 });
    console.log(`Found ${orders.length} orders.`);
    res.json(orders);
  } catch (err) {
    console.error('=== ORDERS GET ERROR ===', err.message);
    if (err.message && err.message.includes('buffering timed out')) {
      return res.status(503).json({ error: 'Database connection timed out. Please try again in a moment.' });
    }
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', verifyToken, async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    
    if (req.user.role !== 'admin' && order.userId.toString() !== req.user.id.toString()) {
        return res.status(403).json({ error: 'Unauthorized access' });
    }

    res.json(order);
  } catch (err) {
    res.status(400).json({ error: 'Invalid order ID' });
  }
});

router.post('/', verifyToken, async (req, res) => {
  console.log('Orders POST body received:', JSON.stringify(req.body, null, 2));
  try {
    const { items, amount, address, deliveryAddress, deliveryRoom, total, customerPhone, officeName, state, city, area } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: "Items are required" });
    }

    // Validate customer phone
    if (!customerPhone || customerPhone.trim() === '') {
      return res.status(400).json({ success: false, message: "Customer phone number is required" });
    }

    console.log('🔍 Debug - customerPhone received:', customerPhone);

    const order = new Order({
      userId: req.user.id,
      items,
      amount: amount !== undefined ? amount : total,
      address: address || deliveryAddress,
      deliveryAddress,
      deliveryRoom,
      state,
      city,
      area,
      total: total !== undefined ? total : amount,
      customerPhone: customerPhone.trim(),
      officeName,
      status: 'pending'
    });

    await order.save();
    res.status(201).json({ success: true, order, message: "Order placed successfully" });
  } catch (err) {
    console.error('Order save error:', err);
    res.status(400).json({ success: false, message: err.message });
  }
});

router.put('/:id/status', verifyToken, async (req, res) => {
  const { status } = req.body;
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // Check authorization: admin, order owner, or merchant (if order contains their items)
    const isAdmin = req.user.role === 'admin';
    const isOwner = order.userId.toString() === req.user.id.toString();
    const isMerchant = req.user.role === 'merchant';
    const isRider = req.user.role === 'rider';
    
    // For merchants: allow status updates for orders (more lenient for development)
    let canModify = isAdmin || isOwner;
    if (isMerchant) {
      // Allow merchants to update any order status (for development)
      // In production, you might want to check restaurant ownership
      canModify = true;
    }
    // For riders: allow status updates for delivery
    if (isRider && ['ready', 'picked_up', 'delivered'].includes(status)) {
      canModify = true;
    }
    
    // Regular users can only cancel their own orders and only if they are pending
    if (isOwner && !isAdmin && !isMerchant && !isRider) {
      if (status !== 'cancelled') {
        return res.status(403).json({ error: 'Users can only cancel their own orders' });
      }
      if (order.status !== 'pending' && order.status !== 'confirmed') { 
        // Allowing cancellation in 'confirmed' as well if it's not yet 'preparing'
        // But for strictly following the plan, I'll stick to 'pending' unless it's confirmed but not preparing.
        // Let's stick to 'pending' as per plan.
        if (order.status !== 'pending') {
            return res.status(400).json({ error: 'Only pending orders can be cancelled' });
        }
      }
    }

    if (!canModify) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    // Handle Cancellation and Refunds
    if (status === 'cancelled' && order.status !== 'cancelled' && order.status !== 'delivered') {
      // Only refund if it was NOT COD
      if (order.paymentMethod !== 'cod') {
        const user = await mongoose.model('User').findById(order.userId);
        if (user) {
          user.bitePoints = (user.bitePoints || 0) + (order.total || 0);
          await user.save();
          console.log(`Refunded ₹${order.total} to user ${user.name} (${user._id})`);
        }
      }
    }

    // Update order status
    order.status = status;
    await order.save();

    // Deduct stock if status becomes 'confirmed' or 'preparing'
    if (status === 'confirmed' || status === 'preparing') {
      for (const item of order.items) {
        // Try id as numeric string (matches foods_utf8.json) or MongoDB _id
        const food = await mongoose.model('Food').findOne({ 
            $or: [{ id: item.id }, { _id: mongoose.Types.ObjectId.isValid(item.id) ? item.id : null }] 
        });
        if (food) {
          food.stock = Math.max(0, (food.stock || 50) - (item.quantity || 1));
          if (food.stock === 0) food.isAvailable = false;
          await food.save();
        }
      }
    }

    res.json({ ok: true, order });
  } catch (err) {
    console.error('Order status update error:', err.message);
    if (err.message && err.message.includes('buffering timed out')) {
      return res.status(503).json({ error: 'Database connection timed out. Please try again.' });
    }
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid order ID format' });
    }
    res.status(400).json({ error: err.message || 'Invalid order ID or data' });
  }
});

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ ok: true });
  } catch (err) {
    console.error('Order deletion error:', err);
    res.status(400).json({ error: 'Invalid order ID' });
  }
});

export default router;
