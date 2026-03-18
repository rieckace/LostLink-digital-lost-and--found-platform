import { Router } from 'express';
import { submitClaim, updateClaimStatus, getUserClaims, createClaimSchema, updateClaimStatusSchema } from '../controllers/claimController';
import { validateRequest } from '../middlewares/validate';
import { requireAuth } from '../middlewares/auth';

const router = Router();

router.use(requireAuth); // All claim routes require authentication

router.post('/', validateRequest(createClaimSchema), submitClaim);
router.patch('/:id/status', validateRequest(updateClaimStatusSchema), updateClaimStatus);
router.get('/my-claims', getUserClaims);

export default router;
