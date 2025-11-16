import { Router } from 'express';
import Post from '../models/Post.js';
import User from '../models/User.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();

// GET /v1/posts - Get all posts (with filters)
router.get('/', async (req, res) => {
  try {
    const { type, campusId, status = 'active', bounds } = req.query;
    const filter = { status };
    
    if (type && (type === 'lost' || type === 'found')) {
      filter.type = type;
    }
    
    if (campusId) {
      filter.campusId = campusId;
    }
    
    // If bounds provided, filter by location (sw, ne coordinates)
    if (bounds) {
      try {
        const { sw, ne } = JSON.parse(bounds);
        filter.location = {
          $geoWithin: {
            $box: [
              [parseFloat(sw.lng), parseFloat(sw.lat)],
              [parseFloat(ne.lng), parseFloat(ne.lat)]
            ]
          }
        };
      } catch (e) {
        // Invalid bounds, ignore
      }
    }
    
    const posts = await Post.find(filter)
      .populate('userId', 'email profile.name profile.rollNumber profile.phone')
      .populate('campusId', 'name slug')
      .sort({ createdAt: -1 })
      .limit(100);
    
    return res.json(posts);
  } catch (e) {
    console.error('Get posts failed', e);
    return res.status(500).json({ error: { code: 'POSTS_FETCH_FAILED', message: 'Failed to fetch posts' } });
  }
});

// GET /v1/posts/:id - Get single post with user info
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('userId', 'email profile.name profile.rollNumber profile.phone')
      .populate('campusId', 'name slug');
    
    if (!post) {
      return res.status(404).json({ error: { code: 'POST_NOT_FOUND', message: 'Post not found' } });
    }
    
    return res.json(post);
  } catch (e) {
    return res.status(500).json({ error: { code: 'POST_FETCH_FAILED', message: 'Failed to fetch post' } });
  }
});

// POST /v1/posts - Create new post
router.post('/', requireAuth, async (req, res) => {
  try {
    const { type, item, itemName, description, lat, lng, campusId } = req.body;
    const email = req.user.email;
    
    if (!type || !item || !itemName || lat === undefined || lng === undefined) {
      return res.status(400).json({ error: { message: 'Missing required fields' } });
    }
    
    if (type !== 'lost' && type !== 'found') {
      return res.status(400).json({ error: { message: 'Invalid post type' } });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: { message: 'User not found' } });
    }
    
    const post = new Post({
      type,
      userId: user._id,
      campusId: campusId || user.profile?.campusId,
      item: {
        key: item.key || item,
        label: item.label || item
      },
      itemName,
      description: description || '',
      location: {
        type: 'Point',
        coordinates: [parseFloat(lng), parseFloat(lat)] // GeoJSON: [lng, lat]
      },
      status: 'active'
    });
    
    await post.save();
    
    const populated = await Post.findById(post._id)
      .populate('userId', 'email profile.name profile.rollNumber profile.phone')
      .populate('campusId', 'name slug');
    
    return res.status(201).json(populated);
  } catch (e) {
    console.error('Create post failed', e);
    return res.status(500).json({ error: { code: 'POST_CREATE_FAILED', message: 'Failed to create post' } });
  }
});

// PATCH /v1/posts/:id - Update post (mark as resolved, etc.)
router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const email = req.user.email;
    
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: { code: 'POST_NOT_FOUND', message: 'Post not found' } });
    }
    
    // Only allow status updates for now
    if (status && ['active', 'resolved', 'closed'].includes(status)) {
      post.status = status;
      if (status === 'resolved') {
        const user = await User.findOne({ email });
        post.resolvedAt = new Date();
        post.resolvedBy = user._id;
      }
      await post.save();
    }
    
    const populated = await Post.findById(post._id)
      .populate('userId', 'email profile.name profile.rollNumber profile.phone')
      .populate('campusId', 'name slug');
    
    return res.json(populated);
  } catch (e) {
    return res.status(500).json({ error: { code: 'POST_UPDATE_FAILED', message: 'Failed to update post' } });
  }
});

export default router;

