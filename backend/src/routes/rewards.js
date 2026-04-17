// API endpoint for free item reward system
import express from 'express';
import mongoose from 'mongoose';
import '../models/Food.js';
import '../models/Order.js';
import { checkFreeItemEligibility, getAvailableFreeItems } from '../free-item-reward.js';

const router = express.Router();

// Check user eligibility for free item
router.get('/eligibility/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const eligibility = await checkFreeItemEligibility(userId);
    res.json({ ok: true, eligibility });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

// Get available free items
router.get('/free-items', async (req, res) => {
  try {
    const freeItems = await getAvailableFreeItems();
    res.json({ ok: true, items: freeItems });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

export default router;
