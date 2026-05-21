import mongoose, { Schema, Document } from 'mongoose';

export interface IQuote extends Document {
  text: string;
  author: string;
  active: boolean;
}

const QuoteSchema: Schema = new Schema({
  text: { type: String, required: true },
  author: { type: String, default: 'Unknown' },
  active: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model<IQuote>('Quote', QuoteSchema);
