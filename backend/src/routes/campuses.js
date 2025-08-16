import { Router } from 'express';
import Campus from '../models/Campus.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { q } = req.query;
    const filter = q ? { $or: [ { name: { $regex: q, $options: 'i' } }, { slug: { $regex: q, $options: 'i' } } ] } : {};
    const campuses = await Campus.find(filter).select('name slug location');
    return res.json(campuses);
  } catch (e) {
    return res.status(500).json({ error: { code: 'CAMPUSES_LIST_FAILED', message: 'Failed to fetch campuses' } });
  }
});

export default router;
