import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  clerkId: { type: String, unique: true },
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: String,
  points: { type: Number, default: 0 },
  sessions: [
    {
      points: { type: Number, required: true },
      mudrasAttempted: { type: Number, default: 0 },
      durationSec: { type: Number, default: 0 },
      startedAt: { type: Date, default: Date.now },
    }
  ],
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
export default User;