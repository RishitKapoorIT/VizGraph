const adminAuth = (req, res, next) => {
  // This middleware should run AFTER the standard auth middleware
  // It assumes req.user has been set by the auth middleware
  
  if (req.user && req.user.role === 'admin') {
    // If the user exists and has the 'admin' role, proceed
    next();
  } else {
    // Otherwise, deny access
    res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
};

export default adminAuth;