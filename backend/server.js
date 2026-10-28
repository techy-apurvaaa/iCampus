import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import facultyRoutes from './routes/facultyRoutes.js';
import { notFound, errorHandler } from './middleware/error.js';
import { seedDemoData } from './seedDemo.js';

const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());
app.get('/api/health', (req, res) => res.json({ ok: true, service: 'CPIP Phase 1 API' }));
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/faculty', facultyRoutes);
app.use(notFound);
app.use(errorHandler);

connectDB().then(async () => {
  await seedDemoData();
  app.listen(PORT, () => console.log(`CPIP backend running on http://localhost:${PORT}`));
}).catch(err => {
  console.error('Database connection failed:', err.message);
  process.exit(1);
});
