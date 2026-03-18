import { Request, Response } from 'express';
import { z } from 'zod';
import { ClaimModel } from '../models/Claim';
import { ItemModel } from '../models/Item';
import { NotificationModel } from '../models/Notification';
import { emitToUserRoom } from '../socket';
import { FlagModel } from '../models/Flag';
import { UserModel } from '../models/User';

export const adminUpdateClaimStatusSchema = z.object({
  body: z.object({
    status: z.enum(['APPROVED', 'REJECTED']),
  }),
});

export const flagClaimSchema = z.object({
  body: z.object({
    reason: z.string().max(300).optional(),
  }),
});

export const listClaims = async (req: Request, res: Response) => {
  const status = (req.query.status as string | undefined)?.toUpperCase();

  try {
    const filters: any = {};
    if (status && ['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
      filters.status = status;
    }

    const claims = await ClaimModel.find(filters)
      .populate('itemId')
      .populate('claimerId', 'name email role')
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    const normalized = claims.map((c: any) => {
      const item = c.itemId && typeof c.itemId === 'object' ? c.itemId : null;
      const claimer = c.claimerId && typeof c.claimerId === 'object' ? c.claimerId : null;

      return {
        ...c,
        id: c._id?.toString?.() ?? String(c._id),
        itemId: item?._id?.toString?.() ?? String(c.itemId),
        claimerId: claimer?._id?.toString?.() ?? String(c.claimerId),
        item: item
          ? {
              ...item,
              id: item._id?.toString?.() ?? String(item._id),
              userId: item.userId?.toString?.() ?? String(item.userId),
            }
          : undefined,
        claimer: claimer
          ? {
              id: claimer._id?.toString?.() ?? String(claimer._id),
              name: claimer.name,
              email: claimer.email,
              role: claimer.role ?? 'user',
            }
          : undefined,
      };
    });

    res.status(200).json({ claims: normalized });
  } catch (error) {
    console.error('Admin listClaims error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const adminUpdateClaimStatus = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { status } = req.body as { status: 'APPROVED' | 'REJECTED' };

  try {
    const claim = await ClaimModel.findById(id).populate('itemId').exec();
    if (!claim) {
      return res.status(404).json({ error: 'Claim not found' });
    }

    const score = typeof (claim as any).aiScore === 'number' ? (claim as any).aiScore : 0;
    const threshold = 75;

    if (status === 'APPROVED' && score < threshold) {
      return res.status(400).json({
        error: `AI score is ${score}%. Approval requires at least ${threshold}%.`,
      });
    }

    claim.status = status;
    (claim as any).resolvedAt = new Date();
    (claim as any).resolvedBy = req.user?.userId;
    const updated = await claim.save();

    const item: any = (claim as any).itemId;
    if (item && status === 'APPROVED') {
      await ItemModel.findByIdAndUpdate(item._id, { status: 'CLAIMED' }).exec();

      // Mediate disputes: reject other pending claims for the same item
      const otherPendingClaims = await ClaimModel.find({
        itemId: item._id,
        status: 'PENDING',
        _id: { $ne: (claim as any)._id },
      })
        .select('_id claimerId')
        .lean()
        .exec();

      if (otherPendingClaims.length) {
        await ClaimModel.updateMany(
          { _id: { $in: otherPendingClaims.map((c: any) => c._id) } },
          {
            $set: {
              status: 'REJECTED',
              resolvedAt: new Date(),
              resolvedBy: req.user?.userId,
            },
          }
        ).exec();

        const rejectionMessage = `Your claim for the ${item.category} was rejected because another claim was approved.`;
        for (const c of otherPendingClaims as any[]) {
          await NotificationModel.create({ userId: c.claimerId, message: rejectionMessage });
          emitToUserRoom(c.claimerId?.toString?.(), 'claim_updated', {
            message: rejectionMessage,
            claimId: c._id?.toString?.() ?? String(c._id),
            status: 'REJECTED',
          });
        }
      }
    }

    // Notify claimer
    const message = item
      ? `Your claim for the ${item.category} has been ${status.toLowerCase()}.`
      : `Your claim has been ${status.toLowerCase()}.`;

    await NotificationModel.create({ userId: (claim as any).claimerId, message });
    emitToUserRoom((claim as any).claimerId?.toString?.(), 'claim_updated', {
      message,
      claimId: (claim as any)._id.toString(),
      status,
    });

    res.status(200).json({
      message: `Claim ${status.toLowerCase()} successfully`,
      claim: { ...updated.toObject(), id: updated._id.toString() },
    });
  } catch (error) {
    console.error('Admin updateClaimStatus error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const flagClaim = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const adminId = req.user?.userId;
  const { reason } = req.body as { reason?: string };

  try {
    const claim = await ClaimModel.findById(id).populate('itemId').exec();
    if (!claim) return res.status(404).json({ error: 'Claim not found' });

    (claim as any).isFlagged = true;
    (claim as any).flagReason = reason?.trim() ? reason.trim() : 'Suspicious / potentially false claim';
    (claim as any).flaggedAt = new Date();
    (claim as any).flaggedBy = adminId;
    await claim.save();

    const item: any = (claim as any).itemId;
    const message = `Your claim${item?.category ? ` for the ${item.category}` : ''} was flagged as suspicious by the admin. If this is a mistake, submit a stronger proof next time. Repeated false claims may lead to a ban.`;

    await NotificationModel.create({ userId: (claim as any).claimerId, message });
    emitToUserRoom((claim as any).claimerId?.toString?.(), 'claim_flagged', {
      message,
      claimId: (claim as any)._id.toString(),
    });

    res.status(200).json({ message: 'Claim flagged', claim: { ...claim.toObject(), id: claim._id.toString() } });
  } catch (error) {
    console.error('Admin flagClaim error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const listAdminItems = async (req: Request, res: Response) => {
  const type = (req.query.type as string | undefined)?.toLowerCase();
  const status = (req.query.status as string | undefined)?.toUpperCase();
  const limitRaw = req.query.limit as string | undefined;
  const skipRaw = req.query.skip as string | undefined;

  const limit = Math.min(Math.max(Number.parseInt(limitRaw ?? '200', 10) || 200, 1), 1000);
  const skip = Math.max(Number.parseInt(skipRaw ?? '0', 10) || 0, 0);

  try {
    const filters: any = {};
    if (type && ['lost', 'found'].includes(type)) {
      filters.type = type;
    }
    if (status && ['ACTIVE', 'CLAIMED'].includes(status)) {
      filters.status = status;
    }

    const items = await ItemModel.find(filters)
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();

    const normalized = items.map((it: any) => {
      const reporter = it.userId && typeof it.userId === 'object' ? it.userId : null;
      return {
        ...it,
        id: it._id?.toString?.() ?? String(it._id),
        userId: reporter?._id?.toString?.() ?? String(it.userId),
        reporter: reporter
          ? {
              id: reporter._id?.toString?.() ?? String(reporter._id),
              name: reporter.name,
              email: reporter.email,
              role: reporter.role ?? 'user',
            }
          : undefined,
      };
    });

    res.status(200).json({ items: normalized });
  } catch (error) {
    console.error('Admin listAdminItems error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAdminItemById = async (req: Request, res: Response) => {
  const id = req.params.id as string;

  try {
    const item = await ItemModel.findById(id)
      .populate('userId', 'name email role')
      .lean()
      .exec();

    if (!item) return res.status(404).json({ error: 'Item not found' });

    const claims = await ClaimModel.find({ itemId: id })
      .populate('claimerId', 'name email role isBanned')
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    const reporter = (item as any).userId && typeof (item as any).userId === 'object' ? (item as any).userId : null;

    const normalizedItem = {
      ...(item as any),
      id: (item as any)._id?.toString?.() ?? String((item as any)._id),
      userId: reporter?._id?.toString?.() ?? String((item as any).userId),
      reporter: reporter
        ? {
            id: reporter._id?.toString?.() ?? String(reporter._id),
            name: reporter.name,
            email: reporter.email,
            role: reporter.role ?? 'user',
          }
        : undefined,
    };

    const normalizedClaims = (claims as any[]).map((c) => {
      const claimer = c.claimerId && typeof c.claimerId === 'object' ? c.claimerId : null;
      return {
        ...c,
        id: c._id?.toString?.() ?? String(c._id),
        itemId: c.itemId?._id?.toString?.() ?? String(c.itemId),
        claimerId: claimer?._id?.toString?.() ?? String(c.claimerId),
        claimer: claimer
          ? {
              id: claimer._id?.toString?.() ?? String(claimer._id),
              name: claimer.name,
              email: claimer.email,
              role: claimer.role ?? 'user',
              isBanned: (claimer as any).isBanned,
            }
          : undefined,
      };
    });

    res.status(200).json({ item: normalizedItem, claims: normalizedClaims });
  } catch (error) {
    console.error('Admin getAdminItemById error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const listFlags = async (req: Request, res: Response) => {
  const status = (req.query.status as string | undefined)?.toUpperCase();
  try {
    const filters: any = {};
    if (status && ['OPEN', 'RESOLVED'].includes(status)) filters.status = status;

    const flags = await FlagModel.find(filters)
      .populate('itemId')
      .populate('reporterId', 'name email role')
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    const normalized = flags.map((f: any) => {
      const item = f.itemId && typeof f.itemId === 'object' ? f.itemId : null;
      const reporter = f.reporterId && typeof f.reporterId === 'object' ? f.reporterId : null;
      return {
        ...f,
        id: f._id?.toString?.() ?? String(f._id),
        itemId: item?._id?.toString?.() ?? String(f.itemId),
        reporterId: reporter?._id?.toString?.() ?? String(f.reporterId),
        item: item ? { ...item, id: item._id?.toString?.() ?? String(item._id) } : undefined,
        reporter: reporter
          ? {
              id: reporter._id?.toString?.() ?? String(reporter._id),
              name: reporter.name,
              email: reporter.email,
              role: reporter.role ?? 'user',
            }
          : undefined,
      };
    });

    res.status(200).json({ flags: normalized });
  } catch (error) {
    console.error('Admin listFlags error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const resolveFlagSchema = z.object({
  body: z.object({
    resolutionNote: z.string().max(500).optional(),
  }),
});

export const resolveFlag = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const adminId = req.user?.userId;
  const { resolutionNote } = req.body as { resolutionNote?: string };

  try {
    const flag = await FlagModel.findById(id).exec();
    if (!flag) return res.status(404).json({ error: 'Flag not found' });

    (flag as any).status = 'RESOLVED';
    (flag as any).resolvedBy = adminId;
    (flag as any).resolvedAt = new Date();
    (flag as any).resolutionNote = resolutionNote;
    await flag.save();

    res.status(200).json({ message: 'Flag resolved' });
  } catch (error) {
    console.error('Admin resolveFlag error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const listUsers = async (req: Request, res: Response) => {
  const q = (req.query.q as string | undefined)?.trim().toLowerCase();
  try {
    const filters: any = {};
    if (q) {
      filters.$or = [{ email: { $regex: q, $options: 'i' } }, { name: { $regex: q, $options: 'i' } }];
    }

    const users = await UserModel.find(filters)
      .select('_id name email role isBanned bannedAt banReason createdAt')
      .sort({ createdAt: -1 })
      .limit(200)
      .lean()
      .exec();

    const normalized = users.map((u: any) => ({
      ...u,
      id: u._id?.toString?.() ?? String(u._id),
    }));

    res.status(200).json({ users: normalized });
  } catch (error) {
    console.error('Admin listUsers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const banUserSchema = z.object({
  body: z.object({
    isBanned: z.boolean(),
    reason: z.string().max(200).optional(),
  }),
});

export const setUserBan = async (req: Request, res: Response) => {
  const userId = req.params.id as string;
  const { isBanned, reason } = req.body as { isBanned: boolean; reason?: string };

  try {
    const user = await UserModel.findById(userId).exec();
    if (!user) return res.status(404).json({ error: 'User not found' });

    (user as any).isBanned = isBanned;
    (user as any).bannedAt = isBanned ? new Date() : undefined;
    (user as any).banReason = isBanned ? reason : undefined;
    await user.save();

    res.status(200).json({ message: isBanned ? 'User banned' : 'User unbanned' });
  } catch (error) {
    console.error('Admin setUserBan error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const listDisputes = async (req: Request, res: Response) => {
  try {
    const groups = await ClaimModel.aggregate([
      { $match: { status: 'PENDING' } },
      { $group: { _id: '$itemId', claimCount: { $sum: 1 }, claimIds: { $push: '$_id' } } },
      { $match: { claimCount: { $gte: 2 } } },
      { $sort: { claimCount: -1 } },
      { $limit: 50 },
    ]);

    const disputeItemIds = groups.map((g: any) => g._id);
    const items = await ItemModel.find({ _id: { $in: disputeItemIds } }).lean().exec();
    const itemById = new Map(items.map((it: any) => [String(it._id), it]));

    const claimIds = groups.flatMap((g: any) => g.claimIds);
    const claims = await ClaimModel.find({ _id: { $in: claimIds } })
      .populate('claimerId', 'name email role')
      .lean()
      .exec();

    const claimsByItem = new Map<string, any[]>();
    for (const c of claims as any[]) {
      const itemId = String((c as any).itemId);
      const arr = claimsByItem.get(itemId) ?? [];
      arr.push({
        ...c,
        id: (c as any)._id?.toString?.() ?? String((c as any)._id),
        claimer: (c as any).claimerId && typeof (c as any).claimerId === 'object'
          ? {
              id: (c as any).claimerId._id?.toString?.() ?? String((c as any).claimerId._id),
              name: (c as any).claimerId.name,
              email: (c as any).claimerId.email,
            }
          : undefined,
      });
      claimsByItem.set(itemId, arr);
    }

    const disputes = groups.map((g: any) => {
      const item = itemById.get(String(g._id));
      const itemId = String(g._id);
      const cl = (claimsByItem.get(itemId) ?? []).sort((a, b) => (b.aiScore ?? 0) - (a.aiScore ?? 0));
      return {
        item: item
          ? {
              ...item,
              id: item._id?.toString?.() ?? String(item._id),
              userId: (item as any).userId?.toString?.() ?? String((item as any).userId),
            }
          : undefined,
        itemId,
        claimCount: g.claimCount,
        claims: cl,
      };
    });

    res.status(200).json({ disputes });
  } catch (error) {
    console.error('Admin listDisputes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAdminMetrics = async (req: Request, res: Response) => {
  try {
    const [
      totalUsers,
      activeUsers,
      bannedUsers,
      activeLostItems,
      activeFoundItems,
      claimedItems,
      totalItems,
      pendingClaims,
      openFlags,
      disputeGroups,
    ] = await Promise.all([
      UserModel.countDocuments({}).exec(),
      UserModel.countDocuments({ isBanned: false }).exec(),
      UserModel.countDocuments({ isBanned: true }).exec(),
      ItemModel.countDocuments({ type: 'lost', status: 'ACTIVE' }).exec(),
      ItemModel.countDocuments({ type: 'found', status: 'ACTIVE' }).exec(),
      ItemModel.countDocuments({ status: 'CLAIMED' }).exec(),
      ItemModel.countDocuments({}).exec(),
      ClaimModel.countDocuments({ status: 'PENDING' }).exec(),
      FlagModel.countDocuments({ status: 'OPEN' }).exec(),
      ClaimModel.aggregate([
        { $match: { status: 'PENDING' } },
        { $group: { _id: '$itemId', claimCount: { $sum: 1 } } },
        { $match: { claimCount: { $gte: 2 } } },
        { $count: 'count' },
      ]),
    ]);

    const disputesOpen = Array.isArray(disputeGroups) && disputeGroups.length ? disputeGroups[0].count ?? 0 : 0;
    const recoveryRate = totalItems > 0 ? claimedItems / totalItems : 0;

    res.status(200).json({
      metrics: {
        users: {
          total: totalUsers,
          active: activeUsers,
          banned: bannedUsers,
        },
        items: {
          activeLost: activeLostItems,
          activeFound: activeFoundItems,
          claimed: claimedItems,
          total: totalItems,
          recoveryRate,
        },
        moderation: {
          pendingClaims,
          openFlags,
          disputesOpen,
        },
      },
    });
  } catch (error) {
    console.error('Admin getAdminMetrics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const listClaimAudits = async (req: Request, res: Response) => {
  const status = (req.query.status as string | undefined)?.toUpperCase();
  const limitRaw = req.query.limit as string | undefined;
  const skipRaw = req.query.skip as string | undefined;

  const limit = Math.min(Math.max(Number.parseInt(limitRaw ?? '200', 10) || 200, 1), 1000);
  const skip = Math.max(Number.parseInt(skipRaw ?? '0', 10) || 0, 0);

  try {
    const filters: any = { status: { $in: ['APPROVED', 'REJECTED'] } };
    if (status && ['APPROVED', 'REJECTED'].includes(status)) {
      filters.status = status;
    }

    const claims = await ClaimModel.find(filters)
      .populate('itemId')
      .populate('claimerId', 'name email role')
      .populate('resolvedBy', 'name email role')
      .sort({ resolvedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();

    const normalized = claims.map((c: any) => {
      const item = c.itemId && typeof c.itemId === 'object' ? c.itemId : null;
      const claimer = c.claimerId && typeof c.claimerId === 'object' ? c.claimerId : null;
      const resolver = c.resolvedBy && typeof c.resolvedBy === 'object' ? c.resolvedBy : null;

      return {
        ...c,
        id: c._id?.toString?.() ?? String(c._id),
        itemId: item?._id?.toString?.() ?? String(c.itemId),
        claimerId: claimer?._id?.toString?.() ?? String(c.claimerId),
        resolvedBy: resolver?._id?.toString?.() ?? (c.resolvedBy ? String(c.resolvedBy) : undefined),
        item: item
          ? {
              ...item,
              id: item._id?.toString?.() ?? String(item._id),
              userId: item.userId?.toString?.() ?? String(item.userId),
            }
          : undefined,
        claimer: claimer
          ? {
              id: claimer._id?.toString?.() ?? String(claimer._id),
              name: claimer.name,
              email: claimer.email,
              role: claimer.role ?? 'user',
            }
          : undefined,
        resolver: resolver
          ? {
              id: resolver._id?.toString?.() ?? String(resolver._id),
              name: resolver.name,
              email: resolver.email,
              role: resolver.role ?? 'user',
            }
          : undefined,
      };
    });

    res.status(200).json({ claims: normalized });
  } catch (error) {
    console.error('Admin listClaimAudits error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
