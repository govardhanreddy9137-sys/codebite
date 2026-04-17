import express from 'express';
import mongoose from 'mongoose';
import Food from '../models/Food.js';
import { verifyToken } from '../utils/jwt.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const foods = await Food.find().sort({ createdAt: 1 });
    if (foods.length > 0) return res.json(foods);
    
    // Fallback: Read from foods_utf8.json if DB is empty or fails
    const fs = await import('fs');
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const jsonPath = path.join(__dirname, '..', '..', 'data', 'foods_utf8.json');
    
    if (fs.existsSync(jsonPath)) {
      const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8').replace(/^\uFEFF/, ''));
      const items = Array.isArray(data) ? data : (data.value || []);
      return res.json(items);
    }
    
    res.json([]);
  } catch (err) {
    console.error('Error fetching foods:', err);
    // Even if DB query crashes, try returning JSON as a last resort
    try {
        const fs = await import('fs');
        const path = await import('path');
        const { fileURLToPath } = await import('url');
        const __dirname = path.dirname(fileURLToPath(import.meta.url));
        const jsonPath = path.join(__dirname, '..', '..', 'data', 'foods_utf8.json');
        if (fs.existsSync(jsonPath)) {
          const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8').replace(/^\uFEFF/, ''));
          return res.json(Array.isArray(data) ? data : (data.value || []));
        }
    } catch {}
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

router.post('/', verifyToken, async (req, res) => {
  const food = new Food(req.body);
  await food.save();
  res.status(201).json(food);
});

router.put('/:id', verifyToken, async (req, res) => {
  try {
    const foodId = req.params.id;
    // Try to find by numeric id first, then by ObjectId
    let food = await Food.findOne({ id: foodId });
    
    if (!food) {
      // Try ObjectId if numeric id not found
      if (mongoose.Types.ObjectId.isValid(foodId)) {
        food = await Food.findById(foodId);
      }
    }
    
    if (!food) return res.status(404).json({ error: 'Food not found' });
    
    // Update the food
    Object.assign(food, req.body);
    await food.save();
    res.json(food);
  } catch (err) {
    console.error('Error updating food:', err);
    res.status(500).json({ error: 'Update failed' });
  }
});

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const foodId = req.params.id;
    // Try to find by numeric id first, then by ObjectId
    let food = await Food.findOne({ id: foodId });
    
    if (!food) {
      // Try ObjectId if numeric id not found
      if (mongoose.Types.ObjectId.isValid(foodId)) {
        food = await Food.findById(foodId);
      }
    }
    
    if (!food) return res.status(404).json({ error: 'Food not found' });
    
    await food.deleteOne();
    res.json({ ok: true });
  } catch (err) {
    console.error('Error deleting food:', err);
    res.status(500).json({ error: 'Delete failed' });
  }
});

export default router;
