import express from 'express';
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import { verifyToken } from '../utils/jwt.js';

const router = express.Router();

// Middleware to ensure the user is a rider
const isRider = (req, res, next) => {
  if (req.user.role !== 'rider' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Riders only.' });
  }
  next();
};

// Get available orders for pickup (Ready status, no riderId)
router.get('/available', verifyToken, isRider, async (req, res) => {
  try {
    const orders = await Order.find({ 
      status: { $in: ['pending', 'confirmed', 'preparing', 'ready'] }, 
      riderId: null
    }).sort({ updatedAt: 1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch available orders' });
  }
});

// Get orders currently assigned to the rider
router.get('/assigned', verifyToken, isRider, async (req, res) => {
  try {
    const orders = await Order.find({ 
      riderId: req.user.id
    }).sort({ updatedAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch assigned orders' });
  }
});

// Claim an order
router.post('/:id/claim', verifyToken, isRider, async (req, res) => {
  try {
    const orderId = req.params.id;
    const riderId = req.user.id;
    const riderName = req.user.name || 'Rider';
    const riderPhone = req.user.phone || '+91 91100 22000';

    // Atomic update to prevent race conditions (two riders claiming the same order)
    const result = await Order.updateOne(
      { 
        _id: orderId, 
        riderId: null,
        status: { $in: ['pending', 'confirmed', 'preparing', 'ready'] } 
      },
      { 
        $set: { 
          riderId: riderId,
          'rider.name': riderName,
          'rider.phone': riderPhone,
          assignedAt: new Date()
        } 
      }
    );

    if (result.matchedCount === 0) {
      return res.status(400).json({ error: 'Order not available for pickup or already claimed' });
    }

    console.log(`Order ${orderId} successfully claimed by ${req.user.email}`);
    res.json({ ok: true, message: 'Order claimed successfully' });
  } catch (err) {
    console.error('Claim error:', err);
    res.status(500).json({ error: 'Failed to claim order' });
  }
});

// Update order status (Picked up / Delivered)
router.put('/:id/status', verifyToken, isRider, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['ready', 'out_for_delivery', 'delivered'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status for rider' });
    }
    
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, riderId: req.user.id },
      { status },
      { new: true }
    );
    if (!order) return res.status(404).json({ error: 'Order not found or not assigned to you' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// Get all users who are riders (Admin only)
router.get('/list', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const User = mongoose.model('User');
    const riders = await User.find({ role: 'rider' }, { name: 1, email: 1, phone: 1 });
    res.json(riders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch riders list' });
  }
});

// Admin assign an order to a rider
router.post('/:id/assign', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const { riderId } = req.body;
    if (!riderId) return res.status(400).json({ error: 'Rider ID required' });

    const User = mongoose.model('User');
    const riderUser = await User.findById(riderId);
    if (!riderUser) return res.status(404).json({ error: 'Rider not found' });

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    order.riderId = riderId;
    if (!order.rider) order.rider = {};
    order.rider.name = riderUser.name;
    order.rider.phone = riderUser.phone || '';
    order.assignedAt = new Date();
    
    await order.save();
    res.json({ ok: true, order });
  } catch (err) {
    res.status(500).json({ error: 'Failed to assign rider' });
  }
});

// Reject/Un-assign an order
router.post('/:id/reject', verifyToken, isRider, async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, riderId: req.user.id },
      { $unset: { riderId: 1 }, $set: { rider: { name: '', phone: '' } } },
      { new: true }
    );
    if (!order) return res.status(404).json({ error: 'Order not found or not assigned to you' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reject order' });
  }
});

export default router;
