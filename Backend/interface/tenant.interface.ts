export interface ITenant {
  name: string;
  slug: string;
  subscriptionType: string;
  subscriptionStartDate: Date;
  subscriptionEndDate: Date;
  isActive: boolean;
}
