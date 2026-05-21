import mongoose, { Schema, Document } from 'mongoose';

export interface IChatMessage {
  senderId: mongoose.Types.ObjectId;
  text: string;
  timestamp: Date;
  seen: boolean;
}

export interface IChat extends Document {
  participants: mongoose.Types.ObjectId[];
  messages: IChatMessage[];
  lastMessage?: { text: string; timestamp: Date; senderId: mongoose.Types.ObjectId };
}

const ChatMessageSchema = new Schema<IChatMessage>(
  {
    senderId: { type: Schema.Types.ObjectId, required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    seen: { type: Boolean, default: false },
  },
  { _id: true }
);

const ChatSchema = new Schema<IChat>(
  {
    participants: [{ type: Schema.Types.ObjectId, required: true }],
    messages: [ChatMessageSchema],
    lastMessage: {
      text: String,
      timestamp: Date,
      senderId: Schema.Types.ObjectId,
    },
  },
  { timestamps: true }
);

ChatSchema.index({ participants: 1 });

export default mongoose.model<IChat>('Chat', ChatSchema);
