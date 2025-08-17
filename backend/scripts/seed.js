import 'dotenv/config';
import mongoose from 'mongoose';
import Campus from '../src/models/Campus.js';

const MONGODB_URI = process.env.MONGODB_URI;

async function run() {
  if (!MONGODB_URI) throw new Error('Missing MONGODB_URI');
  await mongoose.connect(MONGODB_URI, { dbName: process.env.MONGODB_DB || 'pinpoint' });

  const campuses = [
    {
      name: 'Chitkara University, PUNJAB',
      slug: 'chitkara-punjab',
      // coords: [lng, lat]
      location: { type: 'Point', coordinates: [76.6572, 30.5165] },
      // rough square bounds — replace with accurate polygon if available
      bounds: {
        type: 'Polygon',
        coordinates: [[
          [76.6520, 30.5130],
          [76.6620, 30.5130],
          [76.6620, 30.5200],
          [76.6520, 30.5200],
          [76.6520, 30.5130]
        ]]
      }
    },
    {
      name: 'Sample University',
      slug: 'sample-university',
      location: { type: 'Point', coordinates: [77.5946, 12.9716] },
      bounds: { type: 'Polygon', coordinates: [[[77.5920,12.9700],[77.5970,12.9700],[77.5970,12.9730],[77.5920,12.9730],[77.5920,12.9700]]] }
    }
  ];

  // Upsert by slug to keep idempotent
  for (const c of campuses) {
    await Campus.updateOne({ slug: c.slug }, { $setOnInsert: c }, { upsert: true });
  }
  const count = await Campus.countDocuments();
  console.log('Campuses in DB:', count);
}

run()
  .then(() => mongoose.disconnect())
  .catch(err => { console.error(err); process.exit(1); });
