import { Router } from 'express';
import { createProject, deleteProject, getProject, listMyProjects, listProjects, updateProject } from '../controllers/projectController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// Public discovery is restricted to approved projects.
router.get('/', listProjects);
router.get('/mine', protect, listMyProjects);
router.get('/:id', getProject);

// All write operations require authentication.
router.use(protect);
router.post('/', createProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

export default router;
