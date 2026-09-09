import mongoose, { Schema } from "mongoose";
import { IShop } from "../interface/register.interface";
import { BusinessType } from "../constants/business-type";
import { SubscriptionStatus } from "../constants/subscription-plan";

const ShopSchema = new Schema<IShop>(
  {
    shopName: {
      type: String,
      required: true,
      trim: true,
    },

    ownerName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    mobile: {
      type: String,
      required: true,
      trim: true,
    },

    businessType: {
      type: String,
      enum: Object.values(BusinessType),
      required: true,
    },

    address: {
      type: String,
      default: "",
    },

    subscriptionStatus: {
      type: String,
      enum: Object.values(SubscriptionStatus),
      default: SubscriptionStatus.TRIAL,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    logo: {
      type: String,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    trialEndsAt: {
      required: true,
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<IShop>("Shop", ShopSchema);
