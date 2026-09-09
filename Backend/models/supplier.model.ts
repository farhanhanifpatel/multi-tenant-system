import mongoose, { Document, Schema } from "mongoose";

export interface ISupplier extends Document {
  shopId: mongoose.Types.ObjectId;

  name: string;
  companyName?: string;
  mobile: string;
  email?: string;
  address?: string;
  taxNumber?: string;
  notes?: string;

  // Supplier financial balance
  totalPurchaseAmount: number;
  totalPaidAmount: number;
  dueAmount: number;

  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const supplierSchema = new Schema<ISupplier>(
  {
    shopId: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    companyName: {
      type: String,
      trim: true,
    },

    mobile: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    address: {
      type: String,
      trim: true,
    },

    taxNumber: {
      type: String,
      trim: true,
    },

    notes: {
      type: String,
      trim: true,
    },

    totalPurchaseAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalPaidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    dueAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// One mobile number per shop
supplierSchema.index({ shopId: 1, mobile: 1 }, { unique: true });

supplierSchema.index(
  { shopId: 1, email: 1 },
  {
    unique: true,
    partialFilterExpression: {
      email: {
        $exists: true,
        $type: "string",
      },
    },
  },
);

export const Supplier = mongoose.model<ISupplier>("Supplier", supplierSchema);
