import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Get list of downloaded images
router.get('/images', (req, res) => {
  try {
    const imagesDir = path.join(__dirname, '../public/images');
    
    // Check if directory exists
    if (!fs.existsSync(imagesDir)) {
      return res.json({ images: [] });
    }

    const files = fs.readdirSync(imagesDir);
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
    });

    const images = imageFiles.map(file => ({
      filename: file,
      url: `/images/${file}`,
      name: file.replace(/\.[^/.]+$/, ""), // Remove extension
      size: fs.statSync(path.join(imagesDir, file)).size
    }));

    res.json({ images });
  } catch (error) {
    console.error('Error reading images:', error);
    res.status(500).json({ error: 'Failed to load images' });
  }
});

export default router;
