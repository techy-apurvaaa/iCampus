import Project from '../models/Project.js';
import User from '../models/User.js';

const cleanArray = (value) =>
  Array.isArray(value)
    ? value.filter(Boolean).map(v => String(v).trim()).filter(Boolean)
    : String(value || '').split(',').map(v => v.trim()).filter(Boolean);

async function resolveGuide(guideId) {
  if (!guideId) return null;
  const guide = await User.findOne({ _id: guideId, role: 'FACULTY', isActive: true });
  if (!guide) throw Object.assign(new Error('Please select an active faculty guide.'), { status: 400 });
  return guide;
}

export async function listProjects(req, res) {
  const { search = '', status = 'All', department = 'All', domain = 'All', mine = 'false' } = req.query;
  const filter = {};

  if (status !== 'All') filter.status = status;
  if (department !== 'All') filter.department = department;
  if (domain !== 'All') filter.domain = domain;
  if (mine === 'true') filter.submittedBy = req.user?._id;

  // Students can only discover approved projects unless viewing their own workflow.
  if (!req.user || (req.user.role === 'STUDENT' && mine !== 'true')) filter.status = 'Approved';

  if (search.trim()) {
    const q = search.trim();
    filter.$or = [
      { title: { $regex: q, $options: 'i' } },
      { shortDescription: { $regex: q, $options: 'i' } },
      { domain: { $regex: q, $options: 'i' } },
      { technologies: { $regex: q, $options: 'i' } },
      { tags: { $regex: q, $options: 'i' } }
    ];
  }

  const projects = await Project.find(filter)
    .populate('submittedBy', 'name email department role')
    .populate('guideId', 'name email department')
    .populate('reviewedBy', 'name role')
    .sort({ createdAt: -1 });

  res.json({ projects, total: projects.length });
}


export async function listMyProjects(req, res) {
  const projects = await Project.find({ submittedBy: req.user._id, source: 'CAMPUS' })
    .populate('submittedBy', 'name email department role')
    .populate('guideId', 'name email department')
    .populate('reviewedBy', 'name role')
    .sort({ updatedAt: -1, createdAt: -1 });

  res.json({ projects, total: projects.length });
}

export async function getProject(req, res) {
  const project = await Project.findById(req.params.id)
    .populate('submittedBy', 'name email department role')
    .populate('guideId', 'name email department')
    .populate('reviewedBy', 'name role');

  if (!project) return res.status(404).json({ message: 'Project not found' });

  if (
    (!req.user && project.status !== 'Approved') ||
    (req.user?.role === 'STUDENT' &&
      project.status !== 'Approved' &&
      String(project.submittedBy?._id) !== String(req.user._id))
  ) {
    return res.status(403).json({ message: 'Project is not available' });
  }

  project.views += 1;
  await project.save();
  res.json({ project });
}

export async function createProject(req, res, next) {
  try {
    const b = req.body || {};
    const isDraft = b.action === 'draft';

    if (!b.title || b.title.trim().length < 4) {
      return res.status(400).json({ message: 'Title must be at least 4 characters' });
    }
    if (!b.department || !b.description) {
      return res.status(400).json({ message: 'Department and description are required' });
    }

    const guide = req.user.role === 'STUDENT' ? await resolveGuide(b.guideId) : null;

    // A student cannot publish directly. A submitted project always enters Pending.
    if (req.user.role === 'STUDENT' && !isDraft && !guide) {
      return res.status(400).json({ message: 'Select a faculty guide before submitting the project.' });
    }

    const project = await Project.create({
      title: b.title,
      shortDescription: b.shortDescription || '',
      description: b.description,
      problemStatement: b.problemStatement || '',
      objectives: b.objectives || '',
      methodology: b.methodology || '',
      department: b.department,
      academicYear: b.academicYear || '',
      domain: b.domain || '',
      projectType: b.projectType || 'Academic',
      technologies: cleanArray(b.technologies),
      tags: cleanArray(b.tags),
      teamMembers: cleanArray(b.teamMembers),
      guideId: guide?._id || null,
      facultyGuide: guide?.name || b.facultyGuide || '',
      githubUrl: b.githubUrl || '',
      demoUrl: b.demoUrl || '',
      documentationUrl: b.documentationUrl || '',
      submittedBy: req.user._id,
      status: isDraft ? 'Draft' : 'Pending',
      source: 'CAMPUS'
    });

    res.status(201).json({ project });
  } catch (error) {
    next(error);
  }
}

export async function updateProject(req, res, next) {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const owner = String(project.submittedBy) === String(req.user._id);

    if (!owner) {
      return res.status(403).json({ message: 'You can only edit your own project' });
    }
    if (req.user.role === 'STUDENT' && !['Draft', 'Rejected'].includes(project.status)) {
      return res.status(403).json({ message: 'Students can edit only draft or rejected projects' });
    }

    const allowed = [
      'title', 'shortDescription', 'description', 'problemStatement', 'objectives',
      'methodology', 'department', 'academicYear', 'domain', 'projectType',
      'githubUrl', 'demoUrl', 'documentationUrl'
    ];

    for (const key of allowed) {
      if (req.body[key] !== undefined) project[key] = req.body[key];
    }
    for (const key of ['technologies', 'tags', 'teamMembers']) {
      if (req.body[key] !== undefined) project[key] = cleanArray(req.body[key]);
    }

    if (req.user.role === 'STUDENT') {
      const isDraft = req.body.action === 'draft';
      const guide = await resolveGuide(req.body.guideId || project.guideId);

      if (!isDraft && !guide) {
        return res.status(400).json({ message: 'Select a faculty guide before submitting the project.' });
      }

      if (guide) {
        project.guideId = guide._id;
        project.facultyGuide = guide.name;
      }

      project.status = isDraft ? 'Draft' : 'Pending';
      project.reviewNote = '';
      project.reviewedBy = null;
      project.reviewedAt = null;
    }


    await project.save();
    res.json({ project });
  } catch (error) {
    next(error);
  }
}

export async function deleteProject(req, res) {
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ message: 'Project not found' });

  const owner = String(project.submittedBy) === String(req.user._id);
  if (
    req.user.role !== 'ADMIN' &&
    !(req.user.role === 'STUDENT' && owner && ['Draft', 'Rejected'].includes(project.status))
  ) {
    return res.status(403).json({ message: 'You cannot delete this project' });
  }

  await project.deleteOne();
  res.json({ message: 'Project deleted' });
}
