import { Router } from 'express';
import { reportItem, getItems, getItemById, getMyItems, createItemSchema, flagItem, flagItemSchema } from '../controllers/itemController';
import { validateRequest } from '../middlewares/validate';
import { requireAuth, maybeAuth } from '../middlewares/auth';
import { requireAdmin } from '../middlewares/requireAdmin';

const router = Router();

router.get('/', getItems);
router.get('/my', requireAuth, getMyItems);
router.get('/:id', maybeAuth, getItemById);

// Protected routes
router.post('/', requireAuth, validateRequest(createItemSchema), reportItem);
router.post('/:id/flag', requireAuth, requireAdmin, validateRequest(flagItemSchema), flagItem);

export default router;
