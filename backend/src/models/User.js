import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, unique: true, index: true },
    name: { type: String },
    campusId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campus' },
    profileCompleted: { type: Boolean, default: false },
    passwordHash: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model('User', UserSchema);
