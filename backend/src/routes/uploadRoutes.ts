import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../middlewares/auth';
import { uploadImage } from '../controllers/uploadController';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

router.post('/image', requireAuth, upload.single('file'), uploadImage);

export default router;
