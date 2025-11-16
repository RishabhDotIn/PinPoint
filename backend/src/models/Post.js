import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['lost', 'found'], required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    campusId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campus', index: true },
    item: {
      key: { type: String, required: true },
      label: { type: String, required: true }
    },
    itemName: { type: String, required: true },
    description: { type: String },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true } // [lng, lat] for GeoJSON
    },
    status: { type: String, enum: ['active', 'resolved', 'closed'], default: 'active', index: true },
    resolvedAt: { type: Date },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

// GeoJSON index for location queries
PostSchema.index({ location: '2dsphere' });
PostSchema.index({ campusId: 1, status: 1, type: 1 });

export default mongoose.models.Post || mongoose.model('Post', PostSchema);

