import express from 'express';
import mongoose from 'mongoose';
import Poll from '../models/Poll.js';
import { verifyToken } from '../utils/jwt.js';

const router = express.Router();

// Get all polls
router.get('/', async (req, res) => {
  try {
    const polls = await Poll.find().sort({ createdAt: 1 });
    res.json(polls);
  } catch (err) {
    console.error('Error fetching polls:', err);
    res.status(500).json({ error: 'Failed to fetch polls' });
  }
});

// Create new poll
router.post('/', verifyToken, async (req, res) => {
  try {
    const poll = new Poll(req.body);
    await poll.save();
    res.status(201).json(poll);
  } catch (err) {
    console.error('Error creating poll:', err);
    res.status(500).json({ error: 'Failed to create poll' });
  }
});

// Update poll
router.put('/:id', verifyToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid poll ID format' });
    }
    
    const poll = await Poll.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!poll) return res.status(404).json({ error: 'Poll not found' });
    res.json(poll);
  } catch (err) {
    console.error('Error updating poll:', err);
    res.status(500).json({ error: 'Failed to update poll' });
  }
});

// Delete poll
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid poll ID format' });
    }
    
    const poll = await Poll.findByIdAndDelete(req.params.id);
    if (!poll) return res.status(404).json({ error: 'Poll not found' });
    res.json({ ok: true, message: 'Poll deleted successfully' });
  } catch (err) {
    console.error('Error deleting poll:', err);
    res.status(500).json({ error: 'Failed to delete poll' });
  }
});

// Vote on poll
router.post('/:id/vote', verifyToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid poll ID format' });
    }
    const poll = await Poll.findById(req.params.id);
  if (!poll) return res.status(404).json({ error: 'Poll not found' });

    const userId = req.user.id.toString();
    const alreadyVoted = poll.votedBy.some(id => id.toString() === userId);
    
    if (alreadyVoted) {
      poll.votes = Math.max(0, poll.votes - 1);
      poll.votedBy = poll.votedBy.filter(id => id.toString() !== userId);
    } else {
      poll.votes += 1;
      poll.votedBy.push(userId);
    }

  await poll.save();
  res.json({ ok: true, votes: poll.votes, voted: !alreadyVoted });
  } catch (err) {
    console.error('Error voting on poll:', err);
    res.status(500).json({ error: 'Failed to vote' });
  }
});

export default router;
