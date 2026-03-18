import { Request, Response } from 'express';
import { uploadImageBuffer } from '../services/cloudinary';

export const uploadImage = async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const file = req.file as Express.Multer.File | undefined;
  if (!file) {
    return res.status(400).json({ error: 'No file uploaded (field name: file)' });
  }

  try {
    const { url, publicId } = await uploadImageBuffer(file.buffer, file.originalname);
    res.status(201).json({ url, publicId });
  } catch (error) {
    console.error('Upload image error:', error);

    const message =
      error instanceof Error
        ? error.message
        : typeof error === 'object' && error && 'message' in error && typeof (error as any).message === 'string'
          ? String((error as any).message)
          : 'Failed to upload image';

    res.status(500).json({
      error: message,
    });
  }
};
