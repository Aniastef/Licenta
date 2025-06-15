import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    content: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    resourceId: { type: mongoose.Schema.Types.ObjectId, required: true },
    resourceType: {
      type: String,
      required: true,
      enum: ['User', 'Product', 'Event', 'Gallery', 'Article'],
    },

    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }],
    dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }],
    replies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  },
  {
    timestamps: true,
  },
);

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
