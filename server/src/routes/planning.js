import { Router } from 'express';
import {
  getGlobalPlanning,
  getPlanning, addEvent, updateEvent, deleteEvent,
  addOnCall, updateOnCall, deleteOnCall,
} from '../controllers/planningController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/global/all', getGlobalPlanning);
router.get('/:projectId', getPlanning);
router.post('/:projectId/events', addEvent);
router.put('/:projectId/events/:eventId', updateEvent);
router.delete('/:projectId/events/:eventId', deleteEvent);
router.post('/:projectId/oncall', addOnCall);
router.put('/:projectId/oncall/:onCallId', updateOnCall);
router.delete('/:projectId/oncall/:onCallId', deleteOnCall);

export default router;
