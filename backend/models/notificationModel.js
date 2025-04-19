import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, required: true }, // ex: "invite", "like", "follow"
    message: { type: String, required: true },
    link: { type: String }, // unde te duce când dai click
    seen: { type: Boolean, default: false },
    meta: { type: Object, default: {} } // ex: { galleryId: "abc123" }

  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;