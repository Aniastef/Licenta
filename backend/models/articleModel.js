// --- models/articleModel.js ---
import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
      default: "",
    },    
    content: {
      type: String,
      required: true,
    },
    coverImage: {
      type: String, // base64 or Cloudinary URL
    },
    category: {
      type: String,
      enum: [
        "Personal", "Opinion", "Review", "Tutorial", "Poetry", "Reflection",
        "News", "Interview", "Tech", "Art", "Photography","Research", "Journal", "Story"
      ],
      required: true,
        },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Article', articleSchema);
