// models/reportModel.js
import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  reportedUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  reason: { type: String, required: true },
  resolved: { type: Boolean, default: false },
  details: String,
  date: { type: Date, default: Date.now }
});

const Report = mongoose.model("Report", reportSchema);
export default Report;
