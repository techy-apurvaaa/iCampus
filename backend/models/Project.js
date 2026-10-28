import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  shortDescription: { type: String, default: '' },
  description: { type: String, required: true },
  problemStatement: { type: String, default: '' },
  objectives: { type: String, default: '' },
  methodology: { type: String, default: '' },
  department: { type: String, required: true },
  academicYear: { type: String, default: '' },
  domain: { type: String, default: '' },
  projectType: { type: String, default: 'Academic' },
  technologies: { type: [String], default: [] },
  tags: { type: [String], default: [] },
  teamMembers: { type: [String], default: [] },

  // guideId is the actual faculty account responsible for approval.
  // facultyGuide is retained as a readable snapshot for imported/legacy records.
  guideId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  facultyGuide: { type: String, default: '' },

  githubUrl: { type: String, default: '' },
  demoUrl: { type: String, default: '' },
  documentationUrl: { type: String, default: '' },

  status: { type: String, enum: ['Draft', 'Pending', 'Approved', 'Rejected'], default: 'Pending' },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  source: { type: String, enum: ['CAMPUS', 'DATASET'], default: 'CAMPUS' },
  datasetSource: { type: String, default: '' },

  reviewNote: { type: String, default: '' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  reviewedAt: { type: Date, default: null },

  views: { type: Number, default: 0 }
}, { timestamps: true, versionKey: false });

export default mongoose.model('Project', projectSchema);
