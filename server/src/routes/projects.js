import { Router } from 'express';
import { getProjects, createProject, updateProject, deleteProject, addMember, removeMember } from '../controllers/projectController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', getProjects);
router.post('/', createProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);
router.post('/:id/members', addMember);
router.delete('/:id/members/:userId', removeMember);

export default router;
