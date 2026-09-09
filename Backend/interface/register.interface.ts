import { BusinessType } from "../constants/business-type";
import { SubscriptionStatus } from "../constants/subscription-plan";

export interface IShop {
  shopName: string;
  ownerName: string;
  email: string;
  mobile: string;
  shopId: string;
  slug: string;
  logo?: string;
  password: string;
  businessType: BusinessType;
  subscriptionStatus: SubscriptionStatus.TRIAL;
  address?: string;
  isActive?: boolean;
  trialEndsAt: Date;
}
