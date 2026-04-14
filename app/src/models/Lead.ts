import mongoose, { Schema, Model } from 'mongoose';

export interface ILeadDocument {
  _id: mongoose.Types.ObjectId;
  name: string;
  email?: string;
  phone: string;
  message: string;
  vehicleId?: mongoose.Types.ObjectId;
  status: 'New' | 'Contacted' | 'Resolved';
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    message: {
      type: String,
      trim: true,
      default: '',
    },
    vehicleId: {
      type: Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: false,
    },
    status: {
      type: String,
      enum: ['New', 'Contacted', 'Resolved'],
      default: 'New',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

LeadSchema.index({ createdAt: -1 });

const Lead: Model<ILeadDocument> =
  mongoose.models.Lead || mongoose.model<ILeadDocument>('Lead', LeadSchema);

export default Lead;
