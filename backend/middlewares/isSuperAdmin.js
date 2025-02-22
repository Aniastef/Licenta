export const isSuperAdmin = (req, res, next) => {
    if (req.user && req.user.role === "superadmin") {
      next();
    } else {
      res.status(403).json({ error: "Access denied. Only superadmins can perform this action." });
    }
  };
  