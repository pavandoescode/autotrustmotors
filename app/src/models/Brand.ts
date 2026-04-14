import mongoose, { Schema, Model } from 'mongoose';

export interface IBrandDocument {
  _id: mongoose.Types.ObjectId;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const BrandSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Brand name is required'],
      trim: true,
      unique: true,
    },
  },
  { timestamps: true }
);

BrandSchema.index({ name: 1 });

const Brand: Model<IBrandDocument> =
  mongoose.models.Brand || mongoose.model<IBrandDocument>('Brand', BrandSchema);

export default Brand;
