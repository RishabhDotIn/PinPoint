import 'dotenv/config';
import mongoose from 'mongoose';
import Campus from '../src/models/Campus.js';

const MONGODB_URI = process.env.MONGODB_URI;

async function run() {
  if (!MONGODB_URI) throw new Error('Missing MONGODB_URI');
  await mongoose.connect(MONGODB_URI, { dbName: process.env.MONGODB_DB || 'pinpoint' });

  const count = await Campus.countDocuments();
  if (count > 0) {
    console.log('Campuses already present, skipping.');
    return;
  }

  const campuses = [
    {
      name: 'Sample University',
      slug: 'sample-university',
      location: { type: 'Point', coordinates: [77.5946, 12.9716] },
      bounds: { type: 'Polygon', coordinates: [[[77.5920,12.9700],[77.5970,12.9700],[77.5970,12.9730],[77.5920,12.9730],[77.5920,12.9700]]] }
    }
  ];

  await Campus.insertMany(campuses);
  console.log('Seeded campuses:', campuses.length);
}

run()
  .then(() => mongoose.disconnect())
  .catch(err => { console.error(err); process.exit(1); });
