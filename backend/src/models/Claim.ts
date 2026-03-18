import mongoose, { Schema, Types } from 'mongoose';

export type ClaimStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ClaimDocument {
  _id: Types.ObjectId;
  itemId: Types.ObjectId;
  claimerId: Types.ObjectId;
  proofText: string;
  status: ClaimStatus;
  resolvedAt?: Date;
  resolvedBy?: Types.ObjectId;
  isFlagged?: boolean;
  flagReason?: string;
  flaggedAt?: Date;
  flaggedBy?: Types.ObjectId;
  aiScore?: number;
  aiReasons?: string[];
  aiBreakdown?: Record<string, number>;
  aiScoredAt?: Date;
  createdAt: Date;
}

const claimSchema = new Schema<ClaimDocument>(
  {
    itemId: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
    claimerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    proofText: { type: String, required: true, trim: true },
    status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
    resolvedAt: { type: Date, required: false },
    resolvedBy: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    isFlagged: { type: Boolean, default: false },
    flagReason: { type: String, required: false, trim: true },
    flaggedAt: { type: Date, required: false },
    flaggedBy: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    aiScore: { type: Number, required: false },
    aiReasons: { type: [String], default: undefined },
    aiBreakdown: { type: Schema.Types.Mixed, required: false },
    aiScoredAt: { type: Date, required: false },
    createdAt: { type: Date, default: Date.now },
  },
  {
    versionKey: false,
  }
);

export const ClaimModel =
  (mongoose.models.Claim as mongoose.Model<ClaimDocument> | undefined) ||
  mongoose.model<ClaimDocument>('Claim', claimSchema);
