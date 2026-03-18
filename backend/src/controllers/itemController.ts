import { Request, Response } from 'express';
import { z } from 'zod';
import { ItemModel } from '../models/Item';
import { FlagModel } from '../models/Flag';

export const flagItemSchema = z.object({
  params: z.object({
    id: z.string().min(24, 'Invalid Item ID'),
  }),
  body: z.object({
    reason: z.string().min(5, 'Please provide a reason').max(500, 'Reason too long'),
  }),
});
export const createItemSchema = z.object({
  body: z.object({
    type: z.enum(['lost', 'found', 'LOST', 'FOUND']).transform((v) => v.toLowerCase() as 'lost' | 'found'),
    title: z.string().min(3, 'Title is required'),
    category: z.string().min(2, 'Category is required'),
    location: z.string().min(2, 'Location is required'),
    locationLabel: z.string().optional(),
    dateISO: z.string().min(8, 'Date is required'),
    description: z.string().min(5, 'Description is required'),
    tags: z.array(z.string().min(1)).max(25).optional().default([]),
    imageUrl: z.string().url().optional(),

    // Optional fields for future enhancements
    color: z.string().optional(),
    features: z.string().optional(),
    lat: z.number().optional(),
    lng: z.number().optional()
  })
});

export const reportItem = async (req: Request, res: Response) => {
  const { type, title, category, location, locationLabel, dateISO, tags, color, description, features, lat, lng, imageUrl } = req.body;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const geo =
      typeof lat === 'number' && typeof lng === 'number'
        ? { type: 'Point' as const, coordinates: [lng, lat] as [number, number] }
        : undefined;

    const item = await ItemModel.create({
      type,
      title,
      category,
      location,
      locationLabel,
      dateISO,
      tags,
      color,
      description,
      features,
      lat,
      lng,
      geo,
      imageUrl,
      userId,
    });

    // Notify matching users logic would go here
    // Example: Find opposing type items in category within X radius.
    
    res.status(201).json({
      message: 'Item reported successfully',
      item: { ...item.toObject(), id: item._id.toString(), userId: item.userId.toString() },
    });
  } catch (error) {
    console.error('Report Item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getItems = async (req: Request, res: Response) => {
  const { type, status } = req.query;
  
  try {
    const filters: any = {};
    if (type) filters.type = type as any;
    if (status) filters.status = status;

    // Public browse listing: return only minimal fields.
    // Full item details are only returned by GET /items/:id to the reporter or admin.
    const items = await ItemModel.find(filters)
      .select('_id title imageUrl type')
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    const normalized = items.map((it: any) => ({
      id: it._id?.toString?.() ?? String(it._id),
      title: it.title,
      imageUrl: it.imageUrl,
      type: it.type,
    }));

    res.status(200).json({ items: normalized });
  } catch (error) {
    console.error('Get Items error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getItemById = async (req: Request, res: Response) => {
  const id = req.params.id as string;

  try {
    const item = await ItemModel.findById(id).lean().exec();

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const requesterId = req.user?.userId;
    const requesterRole = req.user?.role;
    const ownerId = (item as any).userId?.toString?.() ?? String((item as any).userId);

    const canViewFull = Boolean(requesterId) && (requesterRole === 'admin' || ownerId === requesterId);

    const normalizedId = (item as any)._id?.toString?.() ?? String((item as any)._id);

    if (!canViewFull) {
      return res.status(200).json({
        redacted: true,
        item: {
          id: normalizedId,
          title: (item as any).title,
          imageUrl: (item as any).imageUrl,
          type: (item as any).type,
        },
      });
    }

    // Reporter or admin: return full details.
    res.status(200).json({
      redacted: false,
      item: {
        ...(item as any),
        id: normalizedId,
        userId: ownerId,
      },
    });
  } catch (error) {
    console.error('Get Item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const flagItem = async (req: Request, res: Response) => {
  const itemId = req.params.id as string;
  const { reason } = req.body as { reason: string };
  const reporterId = req.user?.userId;

  if (!reporterId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const item = await ItemModel.findById(itemId).select('_id').lean().exec();
    if (!item) return res.status(404).json({ error: 'Item not found' });

    await FlagModel.create({ itemId, reporterId, reason, status: 'OPEN' });

    res.status(201).json({ message: 'Item flagged for moderator review' });
  } catch (error) {
    console.error('Flag Item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
