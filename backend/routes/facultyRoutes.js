import { Router } from 'express';
import { dashboardStats, listGuides, reviewProject, reviewQueue } from '../controllers/facultyController.js';
import { allowRoles, protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);
router.get('/guides', listGuides);
router.get('/stats', allowRoles('FACULTY'), dashboardStats);
router.get('/review-queue', allowRoles('FACULTY'), reviewQueue);
router.put('/projects/:id/review', allowRoles('FACULTY'), reviewProject);

export default router;
