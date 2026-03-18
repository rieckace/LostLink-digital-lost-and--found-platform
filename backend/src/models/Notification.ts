import mongoose, { Schema, Types } from 'mongoose';

export interface NotificationDocument {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<NotificationDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true, trim: true },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  {
    versionKey: false,
  }
);

export const NotificationModel =
  (mongoose.models.Notification as mongoose.Model<NotificationDocument> | undefined) ||
  mongoose.model<NotificationDocument>('Notification', notificationSchema);
