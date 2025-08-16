import { Router } from 'express';
import User from '../models/User.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const email = req.user.email;
    const user = await User.findOne({ email });
    return res.json(user || { email });
  } catch (e) {
    return res.status(500).json({ error: { code: 'ME_FETCH_FAILED', message: 'Failed to fetch profile' } });
  }
});

router.patch('/', requireAuth, async (req, res) => {
  try {
    const email = req.user.email;
    const { name, campusId } = req.body || {};
    const updates = {};
    if (typeof name === 'string') updates.name = name;
    if (campusId) updates.campusId = campusId;

    let user = await User.findOneAndUpdate(
      { email },
      { $set: updates },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    // Recompute profileCompleted
    const completed = Boolean(user.name && user.campusId);
    if (user.profileCompleted !== completed) {
      user.profileCompleted = completed;
      await user.save();
    }

    return res.json(user);
  } catch (e) {
    return res.status(500).json({ error: { code: 'ME_UPDATE_FAILED', message: 'Failed to update profile' } });
  }
});

export default router;
