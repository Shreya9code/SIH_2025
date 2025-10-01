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
