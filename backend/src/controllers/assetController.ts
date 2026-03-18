import { Request, Response } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { AssetModel } from '../models/Asset';
import { AssetScanModel } from '../models/AssetScan';
import { NotificationModel } from '../models/Notification';
import { emitToUserRoom } from '../socket';

export const createAssetSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name is required').max(80),
    category: z.string().min(2, 'Category is required').max(40),
    description: z.string().max(300).optional(),
  }),
});

export const createAsset = async (req: Request, res: Response) => {
  const ownerId = req.user?.userId;
  if (!ownerId) return res.status(401).json({ error: 'Unauthorized' });

  const { name, category, description } = req.body as {
    name: string;
    category: string;
    description?: string;
  };

  try {
    // short token, URL-safe
    const qrToken = crypto.randomBytes(9).toString('base64url');

    const asset = await AssetModel.create({ ownerId, name, category, description, qrToken });

    res.status(201).json({
      message: 'Asset registered successfully',
      asset: { ...asset.toObject(), id: asset._id.toString(), ownerId: ownerId.toString() },
    });
  } catch (error) {
    console.error('Create Asset error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const listMyAssets = async (req: Request, res: Response) => {
  const ownerId = req.user?.userId;
  if (!ownerId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const assets = await AssetModel.find({ ownerId }).sort({ createdAt: -1 }).lean().exec();
    const normalized = assets.map((a: any) => ({
      ...a,
      id: a._id?.toString?.() ?? String(a._id),
      ownerId: a.ownerId?.toString?.() ?? String(a.ownerId),
    }));

    res.status(200).json({ assets: normalized });
  } catch (error) {
    console.error('List My Assets error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAssetByTokenPublic = async (req: Request, res: Response) => {
  const token = req.params.token as string;

  try {
    const asset = await AssetModel.findOne({ qrToken: token }).lean().exec();
    if (!asset) return res.status(404).json({ error: 'QR not recognized' });

    // Do not leak owner info publicly
    res.status(200).json({
      asset: {
        id: (asset as any)._id?.toString?.() ?? String((asset as any)._id),
        name: (asset as any).name,
        category: (asset as any).category,
        description: (asset as any).description,
        qrToken: (asset as any).qrToken,
      },
    });
  } catch (error) {
    console.error('Get Asset Public error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const foundAssetSchema = z.object({
  params: z.object({ token: z.string().min(6) }),
  body: z.object({
    note: z.string().max(500).optional(),
    locationLabel: z.string().max(120).optional(),
    lat: z.number().optional(),
    lng: z.number().optional(),
  }),
});

export const foundAsset = async (req: Request, res: Response) => {
  const token = req.params.token as string;
  const { note, locationLabel, lat, lng } = req.body as {
    note?: string;
    locationLabel?: string;
    lat?: number;
    lng?: number;
  };

  try {
    const asset = await AssetModel.findOne({ qrToken: token }).lean().exec();
    if (!asset) return res.status(404).json({ error: 'QR not recognized' });

    await AssetScanModel.create({
      assetId: (asset as any)._id,
      finderUserId: req.user?.userId,
      note,
      locationLabel,
      lat,
      lng,
    });

    const message = `Someone scanned your QR tag for "${(asset as any).name}" and reported it found.${locationLabel ? ` Location: ${locationLabel}.` : ''}${note ? ` Note: ${note}` : ''}`;
    await NotificationModel.create({ userId: (asset as any).ownerId, message });
    emitToUserRoom((asset as any).ownerId?.toString?.(), 'new_notification', { message });

    res.status(200).json({ message: 'Owner notified successfully' });
  } catch (error) {
    console.error('Found Asset error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
