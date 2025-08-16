import mongoose from 'mongoose';

const PointSchema = new mongoose.Schema({
  type: { type: String, enum: ['Point'], default: 'Point' },
  coordinates: { type: [Number], required: true }, // [lng, lat]
}, { _id: false });

const PolygonSchema = new mongoose.Schema({
  type: { type: String, enum: ['Polygon'], default: 'Polygon' },
  coordinates: { type: [[[Number]]], required: true },
}, { _id: false });

const CampusSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    location: { type: PointSchema, required: true },
    bounds: { type: PolygonSchema },
  },
  { timestamps: true }
);

CampusSchema.index({ location: '2dsphere' });
CampusSchema.index({ bounds: '2dsphere' });

export default mongoose.models.Campus || mongoose.model('Campus', CampusSchema);
