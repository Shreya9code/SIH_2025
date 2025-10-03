import express from 'express';
import crypto from 'crypto';
import { Group, User } from '../models/index.js';

const router = express.Router();

// Create group
router.post('/', async (req, res) => {
  try {
    const { name, adminClerkId } = req.body;
    if (!name || !adminClerkId) return res.status(400).json({ message: 'name and adminClerkId are required' });
    const inviteCode = crypto.randomBytes(4).toString('hex');

    const admin = await User.findOne({ clerkId: adminClerkId });
    if (!admin) return res.status(404).json({ message: 'Admin user not found' });

    const group = await Group.create({
      name,
      inviteCode,
      adminClerkId,
      members: [{ clerkId: admin.clerkId, name: admin.name || '', email: admin.email }],
      chats: [],
    });
    res.status(201).json({ group, inviteLink: `/join/${inviteCode}` });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

// Join group via invite code
router.post('/join', async (req, res) => {
  try {
    const { inviteCode, clerkId } = req.body;
    if (!inviteCode || !clerkId) return res.status(400).json({ message: 'inviteCode and clerkId required' });
    const group = await Group.findOne({ inviteCode });
    if (!group) return res.status(404).json({ message: 'Group not found' });
    const user = await User.findOne({ clerkId });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const exists = group.members.some(m => m.clerkId === user.clerkId);
    if (!exists) {
      group.members.push({ clerkId: user.clerkId, name: user.name || '', email: user.email });
      await group.save();
    }
    res.json({ group });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

// List groups for a user
router.get('/', async (req, res) => {
  try {
    const { clerkId } = req.query;
    if (!clerkId) return res.status(400).json({ message: 'clerkId is required' });
    const groups = await Group.find({ 'members.clerkId': clerkId }).sort({ updatedAt: -1 });
    res.json({ groups });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

// Post a chat message
router.post('/:groupId/chat', async (req, res) => {
  try {
    const { groupId } = req.params;
    const { clerkId, message } = req.body;
    if (!clerkId || !message) return res.status(400).json({ message: 'clerkId and message required' });
    const user = await User.findOne({ clerkId });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    const isMember = group.members.some(m => m.clerkId === clerkId);
    if (!isMember) return res.status(403).json({ message: 'Not a member' });

    group.chats.push({ clerkId, name: user.name || '', message });
    await group.save();
    res.status(201).json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get chat messages
router.get('/:groupId/chat', async (req, res) => {
  try {
    const { groupId } = req.params;
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    res.json({ chats: group.chats.slice(-200) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

// Group average progress from member sessions
router.get('/:groupId/progress', async (req, res) => {
  try {
    const { groupId } = req.params;
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    // Load all member users with sessions
    const clerkIds = group.members.map(m => m.clerkId);
    const users = await User.find({ clerkId: { $in: clerkIds } }, { sessions: 1, clerkId: 1, name: 1 });

    let allPoints = [];
    const memberSummaries = users.map(u => {
      const total = (u.sessions || []).reduce((s, sess) => s + (Number(sess.points) || 0), 0);
      allPoints.push(...(u.sessions || []).map(sess => Number(sess.points) || 0));
      return { clerkId: u.clerkId, name: u.name || '', totalPoints: total, sessions: u.sessions?.length || 0 };
    });

    const average = allPoints.length ? (allPoints.reduce((a, b) => a + b, 0) / allPoints.length) : 0;
    const mean = average;
    const sorted = [...allPoints].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length ? (sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2) : 0;
    const mode = (() => {
      const freq = new Map();
      for (const v of allPoints) freq.set(v, (freq.get(v) || 0) + 1);
      let best = null, bestC = 0;
      for (const [v, c] of freq.entries()) if (c > bestC) { best = v; bestC = c; }
      return best ?? 0;
    })();

    res.json({ average, mean, median, mode, memberSummaries });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

// Per-member progress within a group
router.get('/:groupId/progress/:clerkId', async (req, res) => {
  try {
    const { groupId, clerkId } = req.params;
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    const isMember = group.members.some(m => m.clerkId === clerkId);
    if (!isMember) return res.status(404).json({ message: 'Member not in group' });

    const user = await User.findOne({ clerkId }, { sessions: 1, name: 1, clerkId: 1 });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const totals = (user.sessions || []).map(s => Number(s.points) || 0);
    const totalPoints = totals.reduce((a,b)=>a+b,0);
    const sessions = user.sessions || [];
    const average = totals.length ? (totalPoints / totals.length) : 0;
    const sorted = [...totals].sort((a,b)=>a-b);
    const mid = Math.floor(sorted.length/2);
    const median = sorted.length ? (sorted.length % 2 ? sorted[mid] : (sorted[mid-1] + sorted[mid]) / 2) : 0;
    const mode = (() => {
      const freq = new Map();
      for (const v of totals) freq.set(v, (freq.get(v) || 0) + 1);
      let best = null, bestC = 0;
      for (const [v, c] of freq.entries()) if (c > bestC) { best = v; bestC = c; }
      return best ?? 0;
    })();

    res.json({
      member: { clerkId: user.clerkId, name: user.name || '' },
      totalPoints,
      sessionsCount: sessions.length,
      average,
      median,
      mode,
      sessions,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

// Alternative: Per-member progress via query param to avoid path encoding issues
router.get('/:groupId/member-progress', async (req, res) => {
  try {
    const { groupId } = req.params;
    const { clerkId } = req.query;
    if (!clerkId) return res.status(400).json({ message: 'clerkId is required' });

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    const isMember = group.members.some(m => m.clerkId === clerkId);
    if (!isMember) return res.status(404).json({ message: 'Member not in group' });

    const user = await User.findOne({ clerkId }, { sessions: 1, name: 1, clerkId: 1 });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const totals = (user.sessions || []).map(s => Number(s.points) || 0);
    const totalPoints = totals.reduce((a,b)=>a+b,0);
    const sessions = user.sessions || [];
    const average = totals.length ? (totalPoints / totals.length) : 0;
    const sorted = [...totals].sort((a,b)=>a-b);
    const mid = Math.floor(sorted.length/2);
    const median = sorted.length ? (sorted.length % 2 ? sorted[mid] : (sorted[mid-1] + sorted[mid]) / 2) : 0;
    const mode = (() => {
      const freq = new Map();
      for (const v of totals) freq.set(v, (freq.get(v) || 0) + 1);
      let best = null, bestC = 0;
      for (const [v, c] of freq.entries()) if (c > bestC) { best = v; bestC = c; }
      return best ?? 0;
    })();

    res.json({
      member: { clerkId: user.clerkId, name: user.name || '' },
      totalPoints,
      sessionsCount: sessions.length,
      average,
      median,
      mode,
      sessions,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

