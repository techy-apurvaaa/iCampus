import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { connectDB } from './config/db.js';
import User from './models/User.js';
import Project from './models/Project.js';

await connectDB();

const adminPassword = await bcrypt.hash('admin123', 12);
const demoPassword = await bcrypt.hash('demo123', 12);

const accounts = [
  {
    name: 'CPIP Administrator',
    email: 'admin@campus.edu',
    role: 'ADMIN',
    department: 'Administration',
    campusId: 'ADMIN-001',
    password: adminPassword
  },
  {
    name: 'Dr. Faculty',
    email: 'faculty@campus.edu',
    role: 'FACULTY',
    department: 'Computer Engineering',
    campusId: 'FAC-001',
    password: demoPassword
  },
  {
    name: 'Demo Student',
    email: 'student@campus.edu',
    role: 'STUDENT',
    department: 'Computer Engineering',
    campusId: 'STU-001',
    password: demoPassword
  }
];

for (const data of accounts) {
  await User.findOneAndUpdate(
    { email: data.email },
    { ...data },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

const admin = await User.findOne({ email: 'admin@campus.edu' });
const faculty = await User.findOne({ email: 'faculty@campus.edu' });
const student = await User.findOne({ email: 'student@campus.edu' });

if (await Project.countDocuments() === 0) {
  await Project.insertMany([
    {
      title: 'Smart Campus Navigation System',
      shortDescription: 'Web platform for finding classrooms and campus services.',
      description: 'A centralized navigation system that helps students discover buildings, labs and facilities.',
      department: 'Computer Engineering', academicYear: '2025-26', domain: 'Web Development',
      projectType: 'Academic', technologies: ['React', 'Node.js', 'MongoDB'],
      tags: ['Campus', 'Maps'], teamMembers: ['Demo Student'], status: 'Approved',
      submittedBy: student._id, guideId: faculty._id, facultyGuide: faculty.name,
      source: 'CAMPUS', views: 482
    },
    {
      title: 'AI-Based Attendance System',
      shortDescription: 'Attendance workflow with face recognition research.',
      description: 'An academic prototype for streamlining classroom attendance.',
      department: 'Computer Engineering', academicYear: '2025-26', domain: 'AI',
      projectType: 'Academic', technologies: ['Python', 'OpenCV'],
      tags: ['AI', 'Attendance'], teamMembers: ['Demo Student'], status: 'Approved',
      submittedBy: student._id, guideId: faculty._id, facultyGuide: faculty.name,
      source: 'CAMPUS', views: 731
    },
    {
      title: 'SecureVault Password Manager',
      shortDescription: 'A secure password organization concept.',
      description: 'A student project exploring password storage and authentication patterns.',
      department: 'Information Technology', academicYear: '2024-25', domain: 'Cybersecurity',
      projectType: 'Academic', technologies: ['JavaScript', 'MongoDB'],
      tags: ['Security'], teamMembers: ['Demo Student'], status: 'Approved',
      submittedBy: student._id, guideId: faculty._id, facultyGuide: faculty.name,
      source: 'CAMPUS', views: 356
    },
    {
      title: 'IoT Smart Irrigation',
      shortDescription: 'Sensor-driven irrigation dashboard.',
      description: 'A prototype that monitors soil conditions and supports efficient irrigation decisions.',
      department: 'Electronics', academicYear: '2025-26', domain: 'IoT',
      projectType: 'Academic', technologies: ['Arduino', 'Node.js'],
      tags: ['IoT', 'Agriculture'], teamMembers: ['Demo Student'], status: 'Pending',
      submittedBy: student._id, guideId: faculty._id, facultyGuide: faculty.name,
      source: 'CAMPUS', views: 298
    }
  ]);
}

console.log('Demo accounts ready. Admin: admin@campus.edu / admin123');
process.exit(0);
