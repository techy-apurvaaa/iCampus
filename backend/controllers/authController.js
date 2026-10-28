import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const DEFAULT_ADMIN = {
  name: 'CPIP Administrator',
  email: 'admin@campus.edu',
  password: 'admin123',
  role: 'ADMIN',
  department: 'Administration'
};

function getJwtSecret() {
  return process.env.JWT_SECRET || 'CPIP_LOCAL_DEVELOPMENT_SECRET_CHANGE_ME_2026';
}

function signToken(user) {
  return jwt.sign(
    { id: user._id.toString(), role: user.role },
    getJwtSecret(),
    { expiresIn: '7d' }
  );
}

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
    campusId: user.campusId,
    avatar: user.avatar
  };
}

function isBcryptHash(value) {
  return typeof value === 'string' && /^\$2[aby]?\$\d{2}\$/.test(value);
}

async function ensureDefaultAdmin() {
  let admin = await User.findOne({ email: DEFAULT_ADMIN.email }).select('+password');
  const hash = await bcrypt.hash(DEFAULT_ADMIN.password, 12);

  if (!admin) {
    admin = await User.create({
      name: DEFAULT_ADMIN.name,
      email: DEFAULT_ADMIN.email,
      password: hash,
      role: DEFAULT_ADMIN.role,
      department: DEFAULT_ADMIN.department
    });
    return admin;
  }

  // Keep the single built-in administrator usable even if an old database
  // contains a stale password/role for this exact account.
  let changed = false;
  if (admin.role !== 'ADMIN') { admin.role = 'ADMIN'; changed = true; }
  if (admin.department !== DEFAULT_ADMIN.department) { admin.department = DEFAULT_ADMIN.department; changed = true; }
  if (!admin.name) { admin.name = DEFAULT_ADMIN.name; changed = true; }
  if (!isBcryptHash(admin.password)) { admin.password = hash; changed = true; }
  else if (await bcrypt.compare(DEFAULT_ADMIN.password, admin.password) === false) { admin.password = hash; changed = true; }
  if (changed) await admin.save();
  return admin;
}

export async function register(req, res, next) {
  try {
    const { name, email, password, department, campusId } = req.body || {};
    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ message: 'Name, email and password are required.' });
    }
    if (name.trim().length < 2) {
      return res.status(400).json({ message: 'Please enter your full name.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email already exists. Please sign in instead.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: 'STUDENT',
      department: department?.trim() || 'Computer Engineering',
      campusId: campusId?.trim() || ''
    });

    return res.status(201).json({
      message: 'Account created successfully.',
      token: signToken(user),
      user: publicUser(user)
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: 'An account with this email already exists. Please sign in instead.' });
    }
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};
    if (!email?.trim() || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Bootstrap/repair the built-in admin before looking up credentials.
    if (normalizedEmail === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
      await ensureDefaultAdmin();
    }

    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });
    if (user.isActive === false) return res.status(403).json({ message: 'This account is inactive. Contact the administrator.' });

    let passwordMatches = false;
    if (isBcryptHash(user.password)) {
      passwordMatches = await bcrypt.compare(password, user.password);
    } else {
      // One-time migration for legacy/plain-text demo records.
      passwordMatches = user.password === password;
      if (passwordMatches) {
        user.password = await bcrypt.hash(password, 12);
        await user.save();
      }
    }

    if (!passwordMatches) return res.status(401).json({ message: 'Invalid email or password' });

    return res.json({ token: signToken(user), user: publicUser(user) });
  } catch (error) {
    console.error('LOGIN ERROR:', error);
    next(error);
  }
}

export async function me(req, res, next) {
  try {
    return res.json({ user: publicUser(req.user) });
  } catch (error) {
    next(error);
  }
}
