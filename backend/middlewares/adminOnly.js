const adminOnly = (req, res, next) => {
  console.log('🔐 Middleware adminOnly → req.user:', req.user);
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admins only.' });
  }
  next();
};

export default adminOnly;
