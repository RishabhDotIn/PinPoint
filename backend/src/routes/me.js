import { Router } from 'express';
import User from '../models/User.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const email = req.user.email;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: { code: 'USER_NOT_FOUND', message: 'Account no longer exists' } });
    // Lazy migration: if old root fields exist, copy into nested profile
    let migrated = false;
    user.profile = user.profile || {};
    if (user.name && !user.profile.name) { user.profile.name = user.name; migrated = true; }
    if (user.campusId && !user.profile.campusId) { user.profile.campusId = user.campusId; migrated = true; }
    if (user.rollNumber && !user.profile.rollNumber) { user.profile.rollNumber = user.rollNumber; migrated = true; }
    if (user.phone && !user.profile.phone) { user.profile.phone = user.phone; migrated = true; }
    if (migrated) {
      const completed = Boolean(user.profile?.name && user.profile?.campusId && user.profile?.rollNumber && user.profile?.phone);
      user.profileCompleted = completed;
      await user.save();
    }
    return res.json(user);
  } catch (e) {
    return res.status(500).json({ error: { code: 'ME_FETCH_FAILED', message: 'Failed to fetch profile' } });
  }
});

router.patch('/', requireAuth, async (req, res) => {
  try {
    const email = req.user.email;
    const body = req.body || {};
    const p = (body.profile && typeof body.profile === 'object') ? body.profile : body;
    const updates = {};
    for (const key of ['name','campusId','rollNumber','phone']) {
      if (p[key] !== undefined) updates[`profile.${key}`] = p[key];
    }

    let user = await User.findOneAndUpdate(
      { email },
      { $set: updates },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    // Recompute profileCompleted (require all major fields)
    const completed = Boolean(user.profile?.name && user.profile?.campusId && user.profile?.rollNumber && user.profile?.phone);
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
