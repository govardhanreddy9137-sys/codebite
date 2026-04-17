import { Router } from 'express';
import mongoose from 'mongoose';
import Restaurant from '../models/Restaurant.js';
import { verifyToken } from '../utils/jwt.js';

const router = Router();

// Get all restaurants
router.get('/', async (req, res) => {
    try {
        const restaurants = await Restaurant.find();
        res.json(restaurants);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update restaurant status
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { isOpen, opensAt } = req.body;
        
        // Try to find by MongoDB _id first, then by custom id field
        let restaurant;
        if (mongoose.Types.ObjectId.isValid(id)) {
            restaurant = await Restaurant.findByIdAndUpdate(
                id,
                { isOpen, opensAt },
                { new: true }
            );
        }
        
        // If not found by _id, try finding by id field
        if (!restaurant) {
            restaurant = await Restaurant.findOneAndUpdate(
                { id: parseInt(id) || id },
                { isOpen, opensAt },
                { new: true }
            );
        }
        
        if (!restaurant) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }
        
        res.json(restaurant);
    } catch (err) {
        console.error('Error updating restaurant:', err);
        res.status(500).json({ error: err.message });
    }
});

export default router;
