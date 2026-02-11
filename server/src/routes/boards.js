import { Router } from 'express';
import {
  getBoard, addColumn, updateColumn, deleteColumn,
  addCard, updateCard, deleteCard, moveCard,
} from '../controllers/boardController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/:projectId', getBoard);
router.post('/:projectId/columns', addColumn);
router.put('/:projectId/columns/:columnId', updateColumn);
router.delete('/:projectId/columns/:columnId', deleteColumn);
router.post('/:projectId/columns/:columnId/cards', addCard);
router.put('/:projectId/columns/:columnId/cards/:cardId', updateCard);
router.delete('/:projectId/columns/:columnId/cards/:cardId', deleteCard);
router.post('/:projectId/move-card', moveCard);

export default router;
