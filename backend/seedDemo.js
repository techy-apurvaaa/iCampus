import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import User from './models/User.js';
import Project from './models/Project.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseCSV(text) {
  const rows = [];
  let row = [], cell = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i], next = text[i + 1];
    if (ch === '"' && quoted && next === '"') { cell += '"'; i++; continue; }
    if (ch === '"') { quoted = !quoted; continue; }
    if (ch === ',' && !quoted) { row.push(cell.trim()); cell = ''; continue; }
    if ((ch === '\n' || ch === '\r') && !quoted) {
      if (ch === '\r' && next === '\n') i++;
      row.push(cell.trim()); cell = '';
      if (row.some(Boolean)) rows.push(row);
      row = [];
      continue;
    }
    cell += ch;
  }
  if (cell || row.length) { row.push(cell.trim()); rows.push(row); }
  const [headers, ...body] = rows;
  return body.map(values => Object.fromEntries(headers.map((h, i) => [h, values[i] || ''])));
}

export async function seedDemoData() {
  if (process.env.SEED_DEMO !== 'true') return;

  const accounts = [
    { name: 'CPIP Administrator', email: 'admin@campus.edu', password: 'admin123', role: 'ADMIN', department: 'Administration', campusId: 'ADMIN-001' },
    { name: 'Dr. Faculty', email: 'faculty@campus.edu', password: 'demo123', role: 'FACULTY', department: 'Computer Engineering', campusId: 'FAC-001' },
    { name: 'Demo Student', email: 'student@campus.edu', password: 'demo123', role: 'STUDENT', department: 'Computer Engineering', campusId: 'STU-001' }
  ];

  for (const account of accounts) {
    const hash = await bcrypt.hash(account.password, 12);
    await User.findOneAndUpdate(
      { email: account.email },
      { ...account, password: hash, isActive: true },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  const admin = await User.findOne({ email: 'admin@campus.edu' });
  const faculty = await User.findOne({ email: 'faculty@campus.edu' });
  const student = await User.findOne({ email: 'student@campus.edu' });

  // Demo campus records let the approval workflow be shown immediately.
  if (await Project.countDocuments({ source: 'CAMPUS' }) === 0) {
    await Project.insertMany([
      {
        title: 'Smart Campus Navigation System',
        shortDescription: 'Web platform for finding classrooms and campus services.',
        description: 'A centralized navigation system that helps students discover buildings, labs and facilities.',
        department: 'Computer Engineering', academicYear: '2025-26', domain: 'Web Development',
        projectType: 'Academic', technologies: ['React', 'Node.js', 'MongoDB'],
        tags: ['Campus', 'Maps'], teamMembers: ['Demo Student'], status: 'Approved',
        submittedBy: student._id, guideId: faculty._id, facultyGuide: faculty.name, source: 'CAMPUS', views: 482
      },
      {
        title: 'AI-Based Attendance System',
        shortDescription: 'Attendance workflow with face recognition research.',
        description: 'An academic prototype for streamlining classroom attendance.',
        department: 'Computer Engineering', academicYear: '2025-26', domain: 'AI',
        projectType: 'Academic', technologies: ['Python', 'OpenCV'],
        tags: ['AI', 'Attendance'], teamMembers: ['Demo Student'], status: 'Approved',
        submittedBy: student._id, guideId: faculty._id, facultyGuide: faculty.name, source: 'CAMPUS', views: 731
      },
      {
        title: 'SecureVault Password Manager',
        shortDescription: 'A secure password organization concept.',
        description: 'A student project exploring password storage and authentication patterns.',
        department: 'Information Technology', academicYear: '2024-25', domain: 'Cybersecurity',
        projectType: 'Academic', technologies: ['JavaScript', 'MongoDB'],
        tags: ['Security'], teamMembers: ['Demo Student'], status: 'Approved',
        submittedBy: student._id, guideId: faculty._id, facultyGuide: faculty.name, source: 'CAMPUS', views: 356
      },
      {
        title: 'IoT Smart Irrigation',
        shortDescription: 'Sensor-driven irrigation dashboard.',
        description: 'A prototype that monitors soil conditions and supports efficient irrigation decisions.',
        department: 'Electronics', academicYear: '2025-26', domain: 'IoT',
        projectType: 'Academic', technologies: ['Arduino', 'Node.js'],
        tags: ['IoT', 'Agriculture'], teamMembers: ['Demo Student'], status: 'Pending',
        submittedBy: student._id, guideId: faculty._id, facultyGuide: faculty.name, source: 'CAMPUS', views: 298
      }
    ]);
  }

  // Reference records power the admin analytics dashboard without pretending
  // that external projects were submitted by campus students.
  if (await Project.countDocuments({ source: 'DATASET' }) === 0) {
    const csvPath = path.resolve(__dirname, 'data/past_fyp_demo.csv');
    if (fs.existsSync(csvPath)) {
      const rows = parseCSV(fs.readFileSync(csvPath, 'utf8').replace(/^\uFEFF/, ''));
      const docs = rows.map(r => ({
        title: r.title,
        shortDescription: r.abstract,
        description: r.abstract || 'Public reference project.',
        department: 'External Dataset',
        academicYear: r.year || '—',
        domain: r.domain || 'Other',
        projectType: 'Reference',
        technologies: String(r.technologies || '').split(',').map(x => x.trim()).filter(Boolean),
        tags: [r.domain || 'Reference', 'Dataset'],
        facultyGuide: 'External dataset reference',
        status: 'Approved',
        submittedBy: admin._id,
        source: 'DATASET',
        datasetSource: 'Kaggle — Past FYP Data',
        documentationUrl: r.source_url || '',
        views: 0
      }));
      if (docs.length) await Project.insertMany(docs);
    }
  }

  console.log('Demo accounts and Phase 1 dashboard data ready.');
}
