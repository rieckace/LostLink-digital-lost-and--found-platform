import { Router } from 'express';
import { requireAuth } from '../middlewares/auth';
import { validateRequest } from '../middlewares/validate';
import {
  createAsset,
  createAssetSchema,
  foundAsset,
  foundAssetSchema,
  getAssetByTokenPublic,
  listMyAssets,
} from '../controllers/assetController';

const router = Router();

// Public: QR scan landing can fetch asset info without leaking owner
router.get('/public/:token', getAssetByTokenPublic);
router.post('/public/:token/found', validateRequest(foundAssetSchema), foundAsset);

// Authenticated: owner management
router.get('/my', requireAuth, listMyAssets);
router.post('/', requireAuth, validateRequest(createAssetSchema), createAsset);

export default router;
