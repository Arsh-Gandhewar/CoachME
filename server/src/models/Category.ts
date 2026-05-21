import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  icon: string;
  color: string;
  gradient: string;
  isActive: boolean;
  order: number;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, unique: true, lowercase: true },
    icon: { type: String, default: '' },
    color: { type: String, default: '#FF5722' },
    gradient: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

CategorySchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
  }
  next();
});

export default mongoose.model<ICategory>('Category', CategorySchema);
