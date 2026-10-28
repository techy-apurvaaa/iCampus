import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Project from '../models/Project.js';

const DEFAULT_ADMIN_EMAIL = 'admin@campus.edu';

export async function stats(req, res) {
  const [
    users, projects, pending, approved, rejected, drafts,
    campusProjects, datasetProjects, departments, domains
  ] = await Promise.all([
    User.countDocuments(),
    Project.countDocuments(),
    Project.countDocuments({ status: 'Pending' }),
    Project.countDocuments({ status: 'Approved' }),
    Project.countDocuments({ status: 'Rejected' }),
    Project.countDocuments({ status: 'Draft' }),
    Project.countDocuments({ source: 'CAMPUS' }),
    Project.countDocuments({ source: 'DATASET' }),
    Project.distinct('department', { status: 'Approved' }),
    Project.distinct('domain', { status: 'Approved' })
  ]);

  const domainCounts = await Project.aggregate([
    { $match: { status: 'Approved' } },
    { $group: { _id: '$domain', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 8 }
  ]);

  const yearCounts = await Project.aggregate([
    { $match: { status: 'Approved' } },
    { $group: { _id: '$academicYear', count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
    { $limit: 10 }
  ]);

  const technologyCounts = await Project.aggregate([
    { $match: { status: 'Approved' } },
    { $unwind: '$technologies' },
    { $group: { _id: '$technologies', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 8 }
  ]);

  res.json({
    stats: {
      users, projects, pending, approved, rejected, drafts,
      campusProjects, datasetProjects,
      departments: departments.length,
      domains: domains.length,
      domainCounts, yearCounts, technologyCounts
    }
  });
}

export async function users(req, res) {
  const list = await User.find().select('-password').sort({ createdAt: -1 });
  res.json({ users: list });
}

export async function createUser(req, res) {
  try {
    const { name, email, password, role, department, studentId, campusId } = req.body || {};
    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    if (!['STUDENT', 'FACULTY'].includes(role)) {
      return res.status(400).json({ message: 'Only Student or Faculty accounts can be created' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) return res.status(409).json({ message: 'An account with this email already exists' });

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: await bcrypt.hash(password, 12),
      role,
      department: department?.trim() || 'Computer Engineering',
      campusId: (campusId || studentId || '').trim(),
      isActive: true
    });

    res.status(201).json({ user: await User.findById(user._id).select('-password') });
  } catch (error) {
    console.error('CREATE USER ERROR:', error);
    res.status(500).json({ message: 'Unable to create account' });
  }
}

export async function updateUser(req, res) {
  const user = await User.findById(req.params.id).select('+password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (user.email === DEFAULT_ADMIN_EMAIL) {
    return res.status(403).json({ message: 'The default administrator cannot be modified here' });
  }

  if (req.body.role && ['STUDENT', 'FACULTY'].includes(req.body.role)) user.role = req.body.role;
  if (req.body.department) user.department = req.body.department;
  if (typeof req.body.isActive === 'boolean') user.isActive = req.body.isActive;
  if (req.body.campusId !== undefined) user.campusId = req.body.campusId;
  await user.save();

  res.json({ user: await User.findById(user._id).select('-password') });
}

export async function deleteUser(req, res) {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (user.email === DEFAULT_ADMIN_EMAIL || String(req.user._id) === req.params.id) {
    return res.status(400).json({ message: 'You cannot delete the default administrator' });
  }

  await User.findByIdAndDelete(req.params.id);
  await Project.deleteMany({ submittedBy: req.params.id });
  res.json({ message: 'User and their projects deleted' });
}
