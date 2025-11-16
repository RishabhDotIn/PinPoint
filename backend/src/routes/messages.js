import { Router } from 'express';
import Message from '../models/Message.js';
import Post from '../models/Post.js';
import User from '../models/User.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();

// GET /v1/messages/:postId - Get all messages for a post
router.get('/:postId', requireAuth, async (req, res) => {
  try {
    const { postId } = req.params;
    const email = req.user.email;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: { message: 'User not found' } });
    }
    
    // Verify user has access to this post (either creator or participant)
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: { code: 'POST_NOT_FOUND', message: 'Post not found' } });
    }
    
    // Get all messages for this post
    const messages = await Message.find({ postId })
      .populate('fromUserId', 'email profile.name profile.rollNumber')
      .populate('toUserId', 'email profile.name profile.rollNumber')
      .sort({ createdAt: 1 });
    
    return res.json(messages);
  } catch (e) {
    console.error('Get messages failed', e);
    return res.status(500).json({ error: { code: 'MESSAGES_FETCH_FAILED', message: 'Failed to fetch messages' } });
  }
});

// POST /v1/messages - Send a message
router.post('/', requireAuth, async (req, res) => {
  try {
    const { postId, toUserId, message } = req.body;
    const email = req.user.email;
    
    if (!postId || !toUserId || !message || !message.trim()) {
      return res.status(400).json({ error: { message: 'Missing required fields' } });
    }
    
    const fromUser = await User.findOne({ email });
    if (!fromUser) {
      return res.status(404).json({ error: { message: 'User not found' } });
    }
    
    // Verify post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: { code: 'POST_NOT_FOUND', message: 'Post not found' } });
    }
    
    // Verify toUserId is valid
    const toUser = await User.findById(toUserId);
    if (!toUser) {
      return res.status(404).json({ error: { message: 'Recipient not found' } });
    }
    
    // Allow poster to message themselves (they can reply to others in the thread)
    // Only prevent self-messaging if the user is NOT the post owner
    const isPostOwner = post.userId.toString() === fromUser._id.toString();
    if (fromUser._id.toString() === toUserId && !isPostOwner) {
      return res.status(400).json({ error: { message: 'Cannot message yourself' } });
    }
    
    const newMessage = new Message({
      postId,
      fromUserId: fromUser._id,
      toUserId,
      message: message.trim()
    });
    
    await newMessage.save();
    
    const populated = await Message.findById(newMessage._id)
      .populate('fromUserId', 'email profile.name profile.rollNumber')
      .populate('toUserId', 'email profile.name profile.rollNumber');
    
    return res.status(201).json(populated);
  } catch (e) {
    console.error('Send message failed', e);
    return res.status(500).json({ error: { code: 'MESSAGE_SEND_FAILED', message: 'Failed to send message' } });
  }
});

// PATCH /v1/messages/:id/read - Mark message as read
router.patch('/:id/read', requireAuth, async (req, res) => {
  try {
    const email = req.user.email;
    const user = await User.findOne({ email });
    
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ error: { code: 'MESSAGE_NOT_FOUND', message: 'Message not found' } });
    }
    
    // Only mark as read if user is the recipient
    if (message.toUserId.toString() === user._id.toString()) {
      message.read = true;
      message.readAt = new Date();
      await message.save();
    }
    
    return res.json(message);
  } catch (e) {
    return res.status(500).json({ error: { code: 'MESSAGE_UPDATE_FAILED', message: 'Failed to update message' } });
  }
});

export default router;

