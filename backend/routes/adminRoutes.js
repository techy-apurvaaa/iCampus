import { Router } from 'express';
import { createUser, deleteUser, stats, updateUser, users } from '../controllers/adminController.js';
import { allowDefaultAdmin, protect } from '../middleware/auth.js';

const router = Router();
router.use(protect, allowDefaultAdmin);

router.get('/stats', stats);
router.get('/users', users);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

export default router;
