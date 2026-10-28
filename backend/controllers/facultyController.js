import Project from '../models/Project.js';
import User from '../models/User.js';

export async function listGuides(req, res) {
  const guides = await User.find({ role: 'FACULTY', isActive: true })
    .select('name email department campusId')
    .sort({ name: 1 });
  res.json({ guides });
}

export async function dashboardStats(req, res) {
  const base = req.user.role === 'FACULTY' ? { guideId: req.user._id } : {};
  const [assigned, pending, approved, rejected] = await Promise.all([
    Project.countDocuments(base),
    Project.countDocuments({ ...base, status: 'Pending' }),
    Project.countDocuments({ ...base, status: 'Approved' }),
    Project.countDocuments({ ...base, status: 'Rejected' })
  ]);
  res.json({ stats: { assigned, pending, approved, rejected } });
}

export async function reviewQueue(req, res) {
  const filter = { status: 'Pending' };

  // Faculty only sees projects explicitly assigned to them.
  if (req.user.role === 'FACULTY') filter.guideId = req.user._id;

  const projects = await Project.find(filter)
    .populate('submittedBy', 'name email department')
    .populate('guideId', 'name email department')
    .sort({ createdAt: 1 });

  res.json({ projects, total: projects.length });
}

export async function reviewProject(req, res) {
  const { status, reviewNote = '' } = req.body || {};
  if (!['Approved', 'Rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid review status' });
  }
  if (status === 'Rejected' && !String(reviewNote).trim()) {
    return res.status(400).json({ message: 'Please add feedback explaining the changes required before returning the project.' });
  }

  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ message: 'Project not found' });

  if (req.user.role !== 'FACULTY') {
    return res.status(403).json({ message: 'Only faculty guides can review projects.' });
  }

  if (String(project.guideId || '') !== String(req.user._id)) {
    return res.status(403).json({ message: 'This project is assigned to another faculty guide.' });
  }

  if (project.status !== 'Pending') {
    return res.status(400).json({ message: 'Only pending projects can be reviewed.' });
  }

  project.status = status;
  project.reviewNote = String(reviewNote).trim();
  project.reviewedBy = req.user._id;
  project.reviewedAt = new Date();
  await project.save();

  res.json({ project });
}
