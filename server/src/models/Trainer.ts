import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface ITrainer extends Document {
  fullName: string;
  email: string;
  mobile?: string;
  password: string;
  profilePhoto?: string;
  bio: string;
  resume?: string;
  experience: number;
  certifications: string[];
  achievements: string[];
  pricing: number;
  priceUnit: string;
  categories: string[];
  category: string;
  languages: string[];
  city: string;
  exactLocation?: { type: string; coordinates: number[] };
  isExactLocationShared: boolean;
  distance?: number;
  availability: Record<string, string[]>;
  sessionTypes: string[];
  specializations: string[];
  rating: number;
  totalReviews: number;
  portfolioImages: string[];
  verificationStatus: 'pending' | 'verified' | 'rejected';
  isPremium: boolean;
  walletBalance: number;
  favorites: mongoose.Types.ObjectId[];
  fcmToken?: string;
  refreshToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  notificationPreferences?: {
    pushEnabled: boolean;
    emailEnabled: boolean;
    smsEnabled: boolean;
    bookingUpdates: boolean;
    newMessages: boolean;
    promotions: boolean;
  };
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const TrainerSchema = new Schema<ITrainer>(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    mobile: { type: String, trim: true },
    password: { type: String, required: true, select: false },
    profilePhoto: { type: String },
    bio: { type: String, default: '' },
    resume: { type: String },
    experience: { type: Number, default: 0 },
    certifications: [{ type: String }],
    achievements: [{ type: String }],
    pricing: { type: Number, default: 0 },
    priceUnit: { type: String, default: 'per session' },
    categories: [{ type: String }],
    category: { type: String, default: '' },
    languages: [{ type: String }],
    city: { type: String, default: '' },
    exactLocation: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] },
    },
    isExactLocationShared: { type: Boolean, default: false },
    distance: { type: Number },
    availability: { type: Schema.Types.Mixed, default: {} },
    sessionTypes: [{ type: String }],
    specializations: [{ type: String }],
    rating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    portfolioImages: [{ type: String }],
    verificationStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
    isPremium: { type: Boolean, default: false },
    walletBalance: { type: Number, default: 0 },
    favorites: [{ type: Schema.Types.ObjectId, ref: 'Trainer' }],
    fcmToken: { type: String },
    refreshToken: { type: String, select: false },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpire: { type: Date, select: false },
    notificationPreferences: {
      pushEnabled: { type: Boolean, default: true },
      emailEnabled: { type: Boolean, default: true },
      smsEnabled: { type: Boolean, default: false },
      bookingUpdates: { type: Boolean, default: true },
      newMessages: { type: Boolean, default: true },
      promotions: { type: Boolean, default: false }
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

TrainerSchema.index({ exactLocation: '2dsphere' });
TrainerSchema.index({ category: 1, rating: -1 });
TrainerSchema.index({ city: 1 });

// Virtual aliases for backward compat with frontend
TrainerSchema.virtual('premium').get(function () { return this.isPremium; });
TrainerSchema.virtual('verified').get(function () { return this.verificationStatus === 'verified'; });
TrainerSchema.virtual('reviewCount').get(function () { return this.totalReviews; });
TrainerSchema.virtual('gallery').get(function () { return this.portfolioImages; });
TrainerSchema.virtual('name').get(function () { return this.fullName; });
TrainerSchema.virtual('price').get(function () { return this.pricing; });
TrainerSchema.virtual('location').get(function () { return this.city; });

// Virtual populate reviews
TrainerSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'trainerId',
});

TrainerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

TrainerSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<ITrainer>('Trainer', TrainerSchema);
