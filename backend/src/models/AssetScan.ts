import mongoose, { Schema, Types } from 'mongoose';

export interface AssetScanDocument {
  _id: Types.ObjectId;
  assetId: Types.ObjectId;
  finderUserId?: Types.ObjectId;
  note?: string;
  locationLabel?: string;
  lat?: number;
  lng?: number;
  createdAt: Date;
}

const assetScanSchema = new Schema<AssetScanDocument>(
  {
    assetId: { type: Schema.Types.ObjectId, ref: 'Asset', required: true },
    finderUserId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    note: { type: String, required: false, trim: true },
    locationLabel: { type: String, required: false, trim: true },
    lat: { type: Number, required: false },
    lng: { type: Number, required: false },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

assetScanSchema.index({ assetId: 1, createdAt: -1 });

export const AssetScanModel =
  (mongoose.models.AssetScan as mongoose.Model<AssetScanDocument> | undefined) ||
  mongoose.model<AssetScanDocument>('AssetScan', assetScanSchema);
