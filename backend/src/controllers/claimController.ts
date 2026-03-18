import { Request, Response } from 'express';
import { z } from 'zod';
import { ClaimModel } from '../models/Claim';
import { ItemModel } from '../models/Item';
import { NotificationModel } from '../models/Notification';
import { scoreClaim } from '../services/claimAi';
import { emitToUserRoom } from '../socket';

export const createClaimSchema = z.object({
  body: z.object({
    itemId: z.string().min(24, 'Invalid Item ID'),
    proofText: z.string().min(10, 'Please provide detailed proof of ownership or discovery.')
  })
});

export const updateClaimStatusSchema = z.object({
  body: z.object({
    status: z.enum(['APPROVED', 'REJECTED'])
  })
});

export const submitClaim = async (req: Request, res: Response) => {
  const { itemId, proofText } = req.body;
  const claimerId = req.user?.userId;

  if (!claimerId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const item = await ItemModel.findById(itemId).lean().exec();
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    if ((item as any).userId?.toString?.() === claimerId) {
      return res.status(400).json({ error: 'You cannot claim your own reported item.' });
    }

    const ai = scoreClaim({
      item: {
        title: (item as any).title,
        category: (item as any).category,
        location: (item as any).location,
        locationLabel: (item as any).locationLabel,
        dateISO: (item as any).dateISO,
        tags: (item as any).tags,
      },
      proofText,
      claimCreatedAtISO: new Date().toISOString(),
    });

    const threshold = 75;
    if (ai.score < threshold) {
      return res.status(400).json({
        error: `Claim match score is ${ai.score}%. You need at least ${threshold}% to initiate a claim. Add more proof details and retry.`,
        aiScore: ai.score,
        aiReasons: ai.reasons,
        aiBreakdown: ai.breakdown,
      });
    }

    const claim = await ClaimModel.create({
      itemId,
      claimerId,
      proofText,
      status: 'PENDING',
      aiScore: ai.score,
      aiReasons: ai.reasons,
      aiBreakdown: ai.breakdown,
      aiScoredAt: new Date(),
    });

    // Real-time notification to the item owner
    const message = `Someone has submitted a claim for your ${item.type.toLowerCase()} item: ${item.category}`;
    
    // Save to DB
    await NotificationModel.create({ userId: (item as any).userId, message });

    // Emit via WebSockets
    emitToUserRoom((item as any).userId?.toString?.(), 'new_notification', {
      message,
      claimId: claim._id.toString(),
    });

    res.status(201).json({
      message: 'Claim submitted successfully',
      claim: { ...claim.toObject(), id: claim._id.toString() },
    });
  } catch (error) {
    console.error('Submit Claim error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateClaimStatus = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { status } = req.body;
  const ownerId = req.user?.userId;

  try {
    const claim = await ClaimModel.findById(id).populate('itemId').exec();

    if (!claim) {
      return res.status(404).json({ error: 'Claim not found' });
    }

    const item: any = (claim as any).itemId;
    if (!item) {
      return res.status(404).json({ error: 'Item not found for this claim' });
    }

    if (item.userId?.toString?.() !== ownerId) {
      return res.status(403).json({ error: 'Only the item reporter can update the claim status.' });
    }

    claim.status = status;
    (claim as any).resolvedAt = new Date();
    (claim as any).resolvedBy = ownerId;
    const updatedClaim = await claim.save();

    // If approved, update the item status to CLAIMED
    if (status === 'APPROVED') {
      await ItemModel.findByIdAndUpdate(item._id, { status: 'CLAIMED' }).exec();
    }

    // Notify the claimer
    const message = `Your claim for the ${item.category} has been ${status.toLowerCase()}.`;
    await NotificationModel.create({ userId: (claim as any).claimerId, message });
    emitToUserRoom((claim as any).claimerId?.toString?.(), 'claim_updated', {
      message,
      claimId: (claim as any)._id.toString(),
      status,
    });

    res.status(200).json({
      message: `Claim ${status.toLowerCase()} successfully`,
      claim: { ...updatedClaim.toObject(), id: updatedClaim._id.toString() },
    });
  } catch (error) {
    console.error('Update Claim error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserClaims = async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  
  try {
    const claims = await ClaimModel.find({ claimerId: userId })
      .populate('itemId')
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    const normalized = claims.map((c: any) => ({
      ...c,
      id: c._id?.toString?.() ?? String(c._id),
      itemId: c.itemId?._id?.toString?.() ?? String(c.itemId),
      claimerId: c.claimerId?.toString?.() ?? String(c.claimerId),
      item: c.itemId && typeof c.itemId === 'object' ? { ...c.itemId, id: c.itemId._id?.toString?.() ?? String(c.itemId._id) } : undefined,
    }));

    res.status(200).json({ claims: normalized });
  } catch (error) {
    console.error('Get User Claims error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
