import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  targetProduct: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  targetEvent: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  targetGallery: { type: mongoose.Schema.Types.ObjectId, ref: 'Gallery' },
  targetArticle: { type: mongoose.Schema.Types.ObjectId, ref: 'Article' },
  details: { type: String },
  timestamp: { type: Date, default: Date.now },
});

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
