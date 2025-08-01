import jwt from 'jsonwebtoken';
import Member from '../models/member.model.js';
import Admin from '../models/admin.model.js';

const ADMIN_ROLES = ['superadmin', 'moderator', 'support'];

// Middleware to verify JWT token and attach user object to request
export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
      return res.status(401).json({ success: false, message: "Not authorized, token missing" });
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      const message = err.name === 'TokenExpiredError'
        ? "Session expired. Please log in again."
        : "Invalid token. Please log in again.";
      return res.status(401).json({ success: false, message });
    }

    const { id, role } = decoded;

    if (!id || !role) {
      return res.status(401).json({ success: false, message: "Invalid token payload" });
    }

    let user;
    if (ADMIN_ROLES.includes(role)) {
      user = await Admin.findById(id).select('-password');
      if (!user) return res.status(401).json({ success: false, message: "Admin not found" });
      req.user = user;
      req.userType = role; // e.g. 'superadmin', 'moderator', etc.
    } else if (role === 'member') {
      user = await Member.findById(id).select('-password');
      if (!user) return res.status(401).json({ success: false, message: "Member not found" });
      req.user = user;
      req.userType = 'member';
    } else {
      return res.status(403).json({ success: false, message: "Invalid role" });
    }

    next();
  } catch (error) {
    console.error("Protect middleware error:", error);
    return res.status(401).json({ success: false, message: "Authentication failed. Please try again." });
  }
};

// Middleware to restrict access based on user roles
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.userType)) {
      return res.status(403).json({
        success: false,
        message: `Access Denied. This resource is restricted to: ${allowedRoles.join(", ")}`,
      });
    }
    next();
  };
};
