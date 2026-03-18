import mongoose, { Schema, Types } from 'mongoose';

export type FlagStatus = 'OPEN' | 'RESOLVED';

export interface FlagDocument {
  _id: Types.ObjectId;
  itemId: Types.ObjectId;
  reporterId: Types.ObjectId;
  reason: string;
  status: FlagStatus;
  resolvedBy?: Types.ObjectId;
  resolvedAt?: Date;
  resolutionNote?: string;
  createdAt: Date;
}

const flagSchema = new Schema<FlagDocument>(
  {
    itemId: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
    reporterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, required: true, trim: true },
    status: { type: String, enum: ['OPEN', 'RESOLVED'], default: 'OPEN' },
    resolvedBy: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    resolvedAt: { type: Date, required: false },
    resolutionNote: { type: String, required: false, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

flagSchema.index({ status: 1, createdAt: -1 });
flagSchema.index({ itemId: 1, status: 1 });

export const FlagModel =
  (mongoose.models.Flag as mongoose.Model<FlagDocument> | undefined) ||
  mongoose.model<FlagDocument>('Flag', flagSchema);
