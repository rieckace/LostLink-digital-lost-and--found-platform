import mongoose, { Schema, Types } from 'mongoose';

export interface AssetDocument {
  _id: Types.ObjectId;
  ownerId: Types.ObjectId;
  name: string;
  category: string;
  description?: string;
  qrToken: string;
  createdAt: Date;
  updatedAt: Date;
}

const assetSchema = new Schema<AssetDocument>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    description: { type: String, required: false, trim: true },
    qrToken: { type: String, required: true, unique: true, index: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

assetSchema.index({ ownerId: 1, createdAt: -1 });

export const AssetModel =
  (mongoose.models.Asset as mongoose.Model<AssetDocument> | undefined) ||
  mongoose.model<AssetDocument>('Asset', assetSchema);
