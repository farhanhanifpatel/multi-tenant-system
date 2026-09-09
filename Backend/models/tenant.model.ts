import mongoose, { Schema } from "mongoose";
import { ITenant } from "../interface/tenant.interface";

const TenantSchema = new Schema<ITenant>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    subscriptionType: {
      type: String,
      enum: ["FREE", "BASIC", "PREMIUM"],
      default: "FREE",
    },
    subscriptionStartDate: {
      type: Date,
      required: true,
    },
    subscriptionEndDate: {
      type: Date,
      required: true,
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

export default mongoose.model<ITenant>("Tenant", TenantSchema);
