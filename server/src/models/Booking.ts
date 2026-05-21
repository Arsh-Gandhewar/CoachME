import mongoose, { Schema, Document } from 'mongoose';

export interface IBooking extends Document {
  userId: mongoose.Types.ObjectId;
  trainerId: mongoose.Types.ObjectId;
  bookingDate: Date;
  timeSlot: string;
  sessionType: string;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  bookingStatus: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  meetingLink?: string;
  notes?: string;
  price: number;
  paymentId?: mongoose.Types.ObjectId;
}

const BookingSchema = new Schema<IBooking>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    trainerId: { type: Schema.Types.ObjectId, ref: 'Trainer', required: true },
    bookingDate: { type: Date, required: true },
    timeSlot: { type: String, required: true },
    sessionType: { type: String, required: true },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
    bookingStatus: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
    meetingLink: { type: String },
    notes: { type: String },
    price: { type: Number, required: true },
    paymentId: { type: Schema.Types.ObjectId, ref: 'Payment' },
  },
  { timestamps: true }
);

BookingSchema.index({ userId: 1, bookingDate: -1 });
BookingSchema.index({ trainerId: 1, bookingDate: -1 });

export default mongoose.model<IBooking>('Booking', BookingSchema);
