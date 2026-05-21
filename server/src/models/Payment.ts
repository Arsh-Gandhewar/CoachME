import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  bookingId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  trainerId: mongoose.Types.ObjectId;
  amount: number;
  paymentMethod: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  paymentStatus: 'created' | 'authorized' | 'captured' | 'failed' | 'refunded';
}

const PaymentSchema = new Schema<IPayment>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    trainerId: { type: Schema.Types.ObjectId, ref: 'Trainer', required: true },
    amount: { type: Number, required: true },
    paymentMethod: { type: String, default: 'razorpay' },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    paymentStatus: { type: String, enum: ['created', 'authorized', 'captured', 'failed', 'refunded'], default: 'created' },
  },
  { timestamps: true }
);

export default mongoose.model<IPayment>('Payment', PaymentSchema);
