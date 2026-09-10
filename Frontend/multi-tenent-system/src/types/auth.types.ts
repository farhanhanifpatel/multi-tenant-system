import type { Dispatch, SetStateAction } from "react";

export interface User {
  _id: string;

  shopId: {
    _id: string;
    shopName: string;
  };

  name: string;
  email: string;
  mobile: string;
  role: string;
}

export interface AuthContextType {
  user: User | null;
  shopName: User["shopId"]["shopName"] | null;
  loading: boolean;
  setUser: Dispatch<SetStateAction<User | null>>;
  logoutUser: () => Promise<void>;
}
