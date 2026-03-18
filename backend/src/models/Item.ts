import mongoose, { Schema, Types } from 'mongoose';

export type ItemType = 'lost' | 'found';
export type ItemStatus = 'ACTIVE' | 'CLAIMED';

export interface ItemDocument {
  _id: Types.ObjectId;
  type: ItemType;
  title: string;
  category: string;
  location: string;
  locationLabel?: string;
  dateISO: string;
  tags: string[];
  color?: string;
  description: string;
  features?: string;
  imageUrl?: string;
  lat?: number;
  lng?: number;
  geo?: {
    type: 'Point';
    coordinates: [number, number];
  };
  status: ItemStatus;
  userId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const itemSchema = new Schema<ItemDocument>(
  {
    type: { type: String, enum: ['lost', 'found'], required: true },
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    locationLabel: { type: String, required: false, trim: true },
    dateISO: { type: String, required: true, trim: true },
    tags: { type: [String], default: [] },
    color: { type: String, required: false, trim: true },
    description: { type: String, required: true, trim: true },
    features: { type: String, required: false },
    imageUrl: { type: String, required: false },
    lat: { type: Number, required: false },
    lng: { type: Number, required: false },
    geo: {
      type: {
        type: String,
        enum: ['Point'],
        required: false,
      },
      coordinates: {
        type: [Number],
        required: false,
      },
    },
    status: { type: String, enum: ['ACTIVE', 'CLAIMED'], default: 'ACTIVE' },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

itemSchema.index({ geo: '2dsphere' });

export const ItemModel =
  (mongoose.models.Item as mongoose.Model<ItemDocument> | undefined) ||
  mongoose.model<ItemDocument>('Item', itemSchema);
