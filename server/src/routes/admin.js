import { Router } from 'express';
import { getUsersWithStats, updateUser } from '../controllers/adminController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/users', getUsersWithStats);
router.put('/users/:id', updateUser);

export default router;
