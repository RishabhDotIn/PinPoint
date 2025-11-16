import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema(
  {
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true, index: true },
    fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    toUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    readAt: { type: Date }
  },
  { timestamps: true }
);

// Index for conversation queries
MessageSchema.index({ postId: 1, createdAt: -1 });
MessageSchema.index({ fromUserId: 1, toUserId: 1, postId: 1 });

export default mongoose.models.Message || mongoose.model('Message', MessageSchema);

