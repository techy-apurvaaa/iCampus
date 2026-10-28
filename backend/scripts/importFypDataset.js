import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import Project from '../models/Project.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const csvPath = process.argv[2] || path.resolve(__dirname, '../data/past_fyp_demo.csv');

function parseCSV(text) {
  const rows = [];
  let row = [], cell = '', quoted = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (ch === '"' && quoted && next === '"') {
      cell += '"'; i++; continue;
    }
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

if (!fs.existsSync(csvPath)) {
  console.error(`Dataset file not found: ${csvPath}`);
  process.exit(1);
}

await connectDB();

const admin = await User.findOne({ email: 'admin@campus.edu' });
if (!admin) {
  console.error('Run `npm run seed` first so the admin account exists.');
  process.exit(1);
}

const raw = fs.readFileSync(csvPath, 'utf8').replace(/^\uFEFF/, '');
const rows = parseCSV(raw);

const docs = rows.map((r, index) => ({
  title: r.title || `Imported Project ${index + 1}`,
  shortDescription: r.abstract || '',
  description: r.abstract || 'Imported reference project from the public FYP dataset.',
  department: 'External Dataset',
  academicYear: r.year ? String(r.year) : '—',
  domain: r.domain || 'Other',
  projectType: 'Reference',
  technologies: String(r.technologies || '').split(',').map(x => x.trim()).filter(Boolean),
  tags: [r.domain || 'Reference', 'Dataset'],
  teamMembers: [],
  facultyGuide: 'External dataset reference',
  githubUrl: '',
  demoUrl: '',
  documentationUrl: r.source_url || '',
  status: 'Approved',
  submittedBy: admin._id,
  source: 'DATASET',
  datasetSource: 'Kaggle — Past FYP Data',
  views: 0
}));

await Project.deleteMany({ source: 'DATASET', datasetSource: 'Kaggle — Past FYP Data' });
if (docs.length) await Project.insertMany(docs);

console.log(`Imported ${docs.length} reference projects.`);
process.exit(0);
