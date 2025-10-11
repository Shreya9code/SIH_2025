import express from 'express';
import jwt from 'jsonwebtoken';
import { Clerk } from '@clerk/clerk-sdk-node';
import User from '../models/User.js';

const router = express.Router();

// Initialize Clerk with your secret key
//const clerk = new Clerk({ apiKey: process.env.CLERK_SECRET_KEY });

// Check if user exists in DB
router.post('/check', async (req, res) => {
  try {
    console.log("🔍 /check endpoint hit");
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email });
    console.log("📊 User exists:", !!user);

    res.json({ exists: !!user });
  } catch (err) {
    console.error("❌ Error checking user:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Register user (with Clerk verification)
router.post('/register', async (req, res) => {
  try {
    console.log("🔍 /register endpoint hit");
    const { clerkId, name, email, password, role } = req.body;
console.log("📋 Request body:", req.body);
    if ( !email||!clerkId ) {
      return res.status(400).json({ message: 'clerkId and email are required' });
    }

    // Verify user exists in Clerk
    /*const clerkUser = await clerk.users.getUser(clerkId).catch(() => null);
    console.log("👤 Clerk user fetched:", !!clerkUser);
    if (!clerkUser) {
      return res.status(400).json({ message: 'Invalid Clerk ID' });
    }*/

    // Check if user exists in MongoDB
    const existingUser = await User.findOne({ $or: [{ email }, { clerkId }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists', user: existingUser });
    }

    // Create user in MongoDB
    const user = await User.create({ clerkId, name, email, password, role });

    console.log("✅ User created in DB:", user._id);

    // Create JWT for your own backend auth if needed
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '7d' });

    res.status(201).json({ success: true, message: 'User registered successfully', token, user });
  } catch (err) {
    console.error("❌ Error registering user:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ message: "Backend API is working!" });
});

export default router;