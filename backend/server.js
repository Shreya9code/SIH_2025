import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { User, Mudra } from "./models/index.js";
import pointsRouter from './routes/points.js';
import groupsRouter from './routes/groups.js';
import usersRouter from './routes/auth.js'

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log(err));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`);
  next();
});

// Mount points router
app.use('/api/users', usersRouter);   // auth.js (register, check)
app.use('/api/users', pointsRouter);
app.use('/api/groups', groupsRouter);
/*
// Check if user exists
app.post("/api/users/check", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email });
    res.json({ exists: !!user });
  } catch (err) {
    console.error("Error checking user:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Register user
app.post("/api/users/register", async (req, res) => {
  try {
    const { clerkId, name, email, password, role } = req.body;

    if (!clerkId || !email) {
      return res.status(400).json({ message: 'clerkId and email are required' });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { clerkId }]
    });

    if (existingUser) {
      return res.json({
        success: true,
        message: 'User already exists',
        user: existingUser
      });
    }

    const user = await User.create({
      clerkId,
      name,
      email,
      password,
      role
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user
    });
  } catch (err) {
    console.error("Error registering user:", err);

    if (err.code === 11000) {
      const existingUser = await User.findOne({
        $or: [{ email: req.body.email }, { clerkId: req.body.clerkId }]
      });
      return res.json({
        success: true,
        message: 'User already exists',
        user: existingUser
      });
    }

    res.status(500).json({
      message: 'Server error',
      error: err.message
    });
  }
});*/

// Test endpoint
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend API is working!" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
