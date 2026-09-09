import mongoose, { Schema } from "mongoose";
import { ICustomer } from "../interface/customer.interface";

const customerSchema = new Schema<ICustomer>(
  {
    shopId: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    mobile: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
    dueAmount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

customerSchema.index(
  {
    shopId: 1,
    mobile: 1,
  },
  {
    unique: true,
  },
);

export const Customer = mongoose.model<ICustomer>("Customer", customerSchema);
