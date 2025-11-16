import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, unique: true, index: true },
    passwordHash: { type: String },
    profile: {
      name: { type: String },
      campusId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campus' },
      rollNumber: { type: String },
      phone: { type: String },
    },
    profileCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model('User', UserSchema);
