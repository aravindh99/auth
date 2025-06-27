export const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: "Access denied: insufficient permissions",
        required: allowedRoles,
        current: req.user.role
      });
    }
    
    next();
  };
};

export default authorizeRole;
  