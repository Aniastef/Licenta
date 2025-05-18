import AuditLog from "../models/auditLogModel.js";

export const getAuditLogs = async (req, res) => {
    try {
      if (!req.user || (req.user.role !== "admin")) {
        return res.status(403).json({ error: "Access denied" });
      }
  
const logs = await AuditLog.find()
  .populate("performedBy", "firstName lastName email")
  .populate("targetUser", "firstName lastName email")
  .populate("targetProduct", "name")
  .populate("targetEvent", "name")
  .populate("targetGallery", "name")
  .populate("targetArticle", "title");
      console.log("Audit logs found:", logs);

      res.json(logs);
    } catch (err) {
      console.error("Error fetching audit logs:", err);
      res.status(500).json({ error: "Server error" });
    }
  };
  
export const addAuditLog = async ({ action, performedBy, details = "", targetUser = null, targetProduct = null, targetEvent = null, targetGallery = null, targetArticle = null }) => {
  try {
    await AuditLog.create({
      action,
      performedBy,
      targetUser,
      targetProduct,
      targetEvent,
      targetGallery,
      targetArticle,
      details
    });
  } catch (err) {
    console.error("Error saving audit log:", err);
  }
};
