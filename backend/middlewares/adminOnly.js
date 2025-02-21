const adminOnly = (req, res, next) => {
    if (!req.user || (req.user.role !== "admin" && req.user.role !== "superadmin")) {
      return res.status(403).json({ error: "Access denied. Admins only." });
    }
    next();
  };
  
  export default adminOnly;
  