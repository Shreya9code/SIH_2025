import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  inviteCode: { type: String, required: true, unique: true },
  adminClerkId: { type: String, required: true },
  members: [{ clerkId: String, name: String, email: String }],
  chats: [
    {
      clerkId: String,
      name: String,
      message: String,
      createdAt: { type: Date, default: Date.now },
    },
  ],
}, { timestamps: true });

const Group = mongoose.model("Group", groupSchema);
export default Group;

