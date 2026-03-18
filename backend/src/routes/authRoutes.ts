import { Router } from 'express';
import { register, login, getProfile, registerSchema, loginSchema } from '../controllers/authController';
import { validateRequest } from '../middlewares/validate';
import { requireAuth } from '../middlewares/auth';

const router = Router();

router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);
router.get('/me', requireAuth, getProfile);

export default router;
