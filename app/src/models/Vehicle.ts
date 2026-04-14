import mongoose, { Schema, Model } from 'mongoose';
import { generateUniqueSlug } from '@/lib/slugUtils';

export interface IVehicleDocument {
  _id: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  marketPrice: number;
  fuelType: 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid' | 'Plug-in Hybrid' | 'CNG' | 'LPG' | 'Hydrogen';
  transmission: 'Automatic' | 'Manual' | 'CVT' | 'DCT' | 'AMT' | 'iMT' | 'Tiptronic';
  owner: '1st Owner' | '2nd Owner' | '3rd Owner' | '4th Owner+';
  mileage: number;
  registrationState: string;
  images: string[];
  features: string[];
  status: 'Available' | 'Sold';
  categoryId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const VehicleSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Vehicle title is required'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
      trim: true,
    },
    brand: {
      type: String,
      required: [true, 'Brand is required'],
      trim: true,
      index: true,
    },
    model: {
      type: String,
      required: [true, 'Model is required'],
      trim: true,
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
      min: 1990,
      max: new Date().getFullYear() + 1,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    marketPrice: {
      type: Number,
      required: [true, 'Market price is required'],
      min: 0,
    },
    fuelType: {
      type: String,
      required: true,
      enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'Plug-in Hybrid', 'CNG', 'LPG', 'Hydrogen'],
    },
    transmission: {
      type: String,
      required: true,
      enum: ['Automatic', 'Manual', 'CVT', 'DCT', 'AMT', 'iMT', 'Tiptronic'],
    },
    owner: {
      type: String,
      required: true,
      enum: ['1st Owner', '2nd Owner', '3rd Owner', '4th Owner+'],
    },
    mileage: {
      type: Number,
      required: [true, 'Mileage/KMs driven is required'],
      min: 0,
    },
    registrationState: {
      type: String,
      required: [true, 'Registration state is required'],
      trim: true,
    },
    images: {
      type: [String],
      default: [],
    },
    features: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['Available', 'Sold'],
      default: 'Available',
      index: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate slug from title + year before validation
VehicleSchema.pre('validate', async function () {
  if (this.title && this.year && (!this.slug || this.isModified('title') || this.isModified('year'))) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const doc = this;
    const Model = doc.constructor as Model<IVehicleDocument>;
    const existingId = doc.isNew ? null : doc._id?.toString() ?? null;

    this.slug = await generateUniqueSlug(
      this.title,
      this.year,
      existingId,
      async (slug, excludeId) => {
        const query: Record<string, unknown> = { slug };
        if (excludeId) query._id = { $ne: excludeId };
        const existing = await Model.findOne(query).lean();
        return !!existing;
      }
    );
  }
});

// Compound indexes for common queries
VehicleSchema.index({ brand: 1, status: 1 });
VehicleSchema.index({ price: 1 });
VehicleSchema.index({ createdAt: -1 });

const Vehicle: Model<IVehicleDocument> =
  mongoose.models.Vehicle || mongoose.model<IVehicleDocument>('Vehicle', VehicleSchema);

export default Vehicle;
