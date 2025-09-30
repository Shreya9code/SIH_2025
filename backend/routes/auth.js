// auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Check if user exists
router.post('/check', async (req, res) => {
  try {
    console.log("🔍 /check endpoint hit");
    const { email } = req.body;
    console.log("📧 Email received:", email);

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    console.log("📊 User exists:", !!user);

    res.json({ exists: !!user });
  } catch (err) {
    console.error("❌ Error checking user:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Register user
router.post('/register', async (req, res) => {
  try {
    console.log("🔍 /register endpoint hit");
    console.log("📦 Request body:", req.body);

    const { clerkId, name, email, password, role } = req.body;

    // Validate required fields
    if (!clerkId || !email) {
      return res.status(400).json({
        message: 'clerkId and email are required',
        received: { clerkId, email }
      });
    }

    console.log("📝 Registering user:", { clerkId, name, email });

    // Check if user exists by email OR clerkId
    const existingUser = await User.findOne({
      $or: [{ email }, { clerkId }]
    });

    if (existingUser) {
      console.log("⚠️ User already exists");
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      clerkId,
      name,
      email,
      password,
      role
    });

    console.log("✅ User created in DB:", user._id);
    console.log("📄 User document:", user);

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user
    });
  } catch (err) {
    console.error("❌ Error registering user:", err);
    res.status(500).json({
      message: 'Server error',
      error: err.message,
      stack: err.stack
    });
  }
});

// Test endpoint
router.get('/test', (req, res) => {
  console.log("✅ Test endpoint hit");
  res.json({ message: "Backend API is working!" });
});

module.exports = router;