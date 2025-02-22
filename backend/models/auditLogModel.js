import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema({
  action: { type: String, required: true }, // Ex: "User deleted", "Role changed"
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Cine a făcut acțiunea
  targetUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Dacă se aplică unui user
  timestamp: { type: Date, default: Date.now }, // Când s-a făcut acțiunea
  details: { type: String } // Informații adiționale
});

const AuditLog = mongoose.model("AuditLog", auditLogSchema);
export default AuditLog;
