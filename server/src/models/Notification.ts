import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  userModel: 'User' | 'Trainer';
  title: string;
  message: string;
  type: 'booking' | 'chat' | 'payment' | 'system';
  readStatus: boolean;
  data?: any;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, refPath: 'userModel' },
    userModel: { type: String, required: true, enum: ['User', 'Trainer'] },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['booking', 'chat', 'payment', 'system'], default: 'system' },
    readStatus: { type: Boolean, default: false },
    data: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, readStatus: 1, createdAt: -1 });

export default mongoose.model<INotification>('Notification', NotificationSchema);
