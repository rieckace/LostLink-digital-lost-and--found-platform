import mongoose, { Schema, Types } from 'mongoose';

export interface UserDocument {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  isBanned: boolean;
  bannedAt?: Date;
  banReason?: string;
  createdAt: Date;
}

const userSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user', required: true },
    isBanned: { type: Boolean, default: false },
    bannedAt: { type: Date, required: false },
    banReason: { type: String, required: false, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  {
    versionKey: false,
  }
);

export const UserModel =
  (mongoose.models.User as mongoose.Model<UserDocument> | undefined) ||
  mongoose.model<UserDocument>('User', userSchema);
