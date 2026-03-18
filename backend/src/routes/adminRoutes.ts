import { Router } from 'express';
import { validateRequest } from '../middlewares/validate';
import { requireAuth } from '../middlewares/auth';
import { requireAdmin } from '../middlewares/requireAdmin';
import {
	adminUpdateClaimStatus,
	adminUpdateClaimStatusSchema,
	flagClaim,
	flagClaimSchema,
	getAdminItemById,
	getAdminMetrics,
	listClaims,
	listClaimAudits,
	listAdminItems,
	listDisputes,
	listFlags,
	listUsers,
	resolveFlag,
	resolveFlagSchema,
	setUserBan,
	banUserSchema,
} from '../controllers/adminController';

const router = Router();

router.use(requireAuth);
router.use(requireAdmin);

router.get('/claims', listClaims);
router.get('/claims/audit', listClaimAudits);
router.get('/metrics', getAdminMetrics);
router.get('/items', listAdminItems);
router.get('/items/:id', getAdminItemById);
router.get('/flags', listFlags);
router.patch('/flags/:id/resolve', validateRequest(resolveFlagSchema), resolveFlag);
router.get('/disputes', listDisputes);
router.get('/users', listUsers);
router.patch('/users/:id/ban', validateRequest(banUserSchema), setUserBan);
router.patch('/claims/:id/status', validateRequest(adminUpdateClaimStatusSchema), adminUpdateClaimStatus);
router.patch('/claims/:id/flag', validateRequest(flagClaimSchema), flagClaim);

export default router;
