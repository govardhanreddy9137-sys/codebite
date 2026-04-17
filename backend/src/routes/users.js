import express from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { verifyToken } from '../utils/jwt.js';
import { hashPassword } from '../utils/bcrypt.js';

const router = express.Router();

// Get all users (Admin only)
router.get('/', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    const users = await User.find({}, '-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Update user role (Admin only)
router.put('/:id/role', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const { password: _pw, ...safeUser } = user.toObject();
    res.json(safeUser);
  } catch (err) {
    res.status(400).json({ error: 'Update failed' });
  }
});

router.get('/me', verifyToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const { password: _pw, ...safeUser } = user.toObject();
    res.json(safeUser);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

router.get('/wishlist', verifyToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }
    const user = await User.findById(req.user.id).populate('wishlist');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user.wishlist || []);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
});

router.post('/wishlist/:foodId', verifyToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const foodId = req.params.foodId;
    if (!mongoose.Types.ObjectId.isValid(foodId)) {
      return res.status(400).json({ error: 'Invalid food ID format' });
    }
    if (user.wishlist.includes(foodId)) {
      user.wishlist = user.wishlist.filter(id => id.toString() !== foodId);
    } else {
      user.wishlist.push(foodId);
    }
    await user.save();
    res.json({ ok: true, wishlist: user.wishlist });
  } catch (err) {
    res.status(400).json({ error: 'Invalid food ID or operation failed' });
  }
});

router.put('/me', verifyToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }
    const user = await User.findByIdAndUpdate(req.user.id, req.body, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const { password: _pw, ...safeUser } = user.toObject();
    res.json(safeUser);
  } catch (err) {
    res.status(400).json({ error: 'Update failed' });
  }
});

export default router;
