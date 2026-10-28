import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = () => process.env.JWT_SECRET || 'CPIP_LOCAL_DEVELOPMENT_SECRET_CHANGE_ME_2026';

export async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7).trim() : null;
    if (!token) return res.status(401).json({ message: 'Authentication required. Please sign in.' });

    const decoded = jwt.verify(token, JWT_SECRET());
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ message: 'User no longer exists. Please sign in again.' });
    if (user.isActive === false) return res.status(403).json({ message: 'This account is inactive.' });

    req.user = user;
    next();
  } catch (error) {
    console.error('AUTH MIDDLEWARE ERROR:', error.message);
    return res.status(401).json({ message: 'Invalid or expired session. Please sign in again.' });
  }
}

export function allowDefaultAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'ADMIN' || req.user.email !== 'admin@campus.edu') {
    return res.status(403).json({ message: 'Only the default CPIP administrator can access this area' });
  }
  next();
}

export function allowRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission for this action' });
    }
    next();
  };
}
