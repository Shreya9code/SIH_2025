const express = require('express');
const Mudra = require('../models');

const router = express.Router();

// Get all mudras with filtering
router.get('/', async (req, res) => {
  try {
    const { category, animal, difficulty, search } = req.query;
    let filter = {};

    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (animal) filter.animalsRepresented = { $in: [new RegExp(animal, 'i')] };
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { sanskritName: new RegExp(search, 'i') },
        { meaning: new RegExp(search, 'i') }
      ];
    }

    const mudras = await Mudra.find(filter);
    res.json(mudras);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single mudra
router.get('/:id', async (req, res) => {
  try {
    const mudra = await Mudra.findById(req.params.id);
    if (!mudra) {
      return res.status(404).json({ message: 'Mudra not found' });
    }
    res.json(mudra);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;