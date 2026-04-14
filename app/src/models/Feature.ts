import mongoose, { Schema, Model } from 'mongoose';

export interface IFeatureDocument {
  _id: mongoose.Types.ObjectId;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const FeatureSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Feature name is required'],
      unique: true,
      trim: true,
    },
  },
  { timestamps: true }
);

FeatureSchema.index({ name: 1 });

const Feature: Model<IFeatureDocument> =
  mongoose.models.Feature || mongoose.model<IFeatureDocument>('Feature', FeatureSchema);

export default Feature;
