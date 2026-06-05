import mongoose, { Schema, Document } from 'mongoose';
import Trainer from './Trainer';

export interface IReview extends Document {
  userId: mongoose.Types.ObjectId;
  trainerId: mongoose.Types.ObjectId;
  bookingId?: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
}

const ReviewSchema = new Schema<IReview>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    trainerId: { type: Schema.Types.ObjectId, ref: 'Trainer', required: true },
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

ReviewSchema.index({ trainerId: 1, createdAt: -1 });
ReviewSchema.index({ bookingId: 1 }, { unique: true, partialFilterExpression: { bookingId: { $exists: true } } });

// After saving a review, update trainer's avg rating and total reviews
ReviewSchema.post('save', async function () {
  const stats = await (this.constructor as any).aggregate([
    { $match: { trainerId: this.trainerId } },
    { $group: { _id: '$trainerId', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  if (stats.length > 0) {
    await Trainer.findByIdAndUpdate(this.trainerId, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      totalReviews: stats[0].count,
    });
  }
});

export default mongoose.model<IReview>('Review', ReviewSchema);
