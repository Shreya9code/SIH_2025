import express from 'express';
import User from '../models/User.js';

const router = express.Router();

router.put('/:id/points', async (req, res) => {
  const { id } = req.params; // this is the Clerk ID
  const { points } = req.body;

  try {
    // Coerce to number and validate
    const numericPoints = Number(points);
    if (!Number.isFinite(numericPoints)) {
      return res.status(400).json({ message: 'Invalid points value' });
    }

    const user = await User.findOne({ clerkId: id }); // <- use clerkId
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.points = numericPoints;
    await user.save();

    res.json({ message: 'Points updated successfully', points: user.points });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
 
// Additional session endpoints
router.post('/:id/sessions', async (req, res) => {
  const { id } = req.params; // Clerk ID
  const { points, mudrasAttempted, durationSec, startedAt } = req.body;

  try {
    const numericPoints = Number(points);
    if (!Number.isFinite(numericPoints)) {
      return res.status(400).json({ message: 'Invalid points value' });
    }

    const user = await User.findOne({ clerkId: id });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const session = {
      points: numericPoints,
      mudrasAttempted: Number(mudrasAttempted) || 0,
      durationSec: Number(durationSec) || 0,
      startedAt: startedAt ? new Date(startedAt) : new Date(),
    };

    user.sessions.push(session);
    await user.save();

    res.status(201).json({ message: 'Session recorded', session });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id/sessions', async (req, res) => {
  const { id } = req.params; // Clerk ID
  try {
    const user = await User.findOne({ clerkId: id });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const sessions = (user.sessions || []).sort((a, b) => new Date(a.startedAt) - new Date(b.startedAt));
    res.json({ sessions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});
