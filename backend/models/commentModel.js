import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  content: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  resourceId: { type: mongoose.Schema.Types.ObjectId, required: true },
  resourceType: { type: String, required: true, enum: ["Product", "Event"] },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] }], // Asigură-te că este array
  dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] }], // Asigură-te că este array
  replies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  createdAt: { type: Date, default: Date.now },
});

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
