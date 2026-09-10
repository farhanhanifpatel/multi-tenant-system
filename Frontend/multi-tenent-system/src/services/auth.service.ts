import { api } from "../api/axios";

export const login = async (data: { email: string; password: string }) => {
  const response = await api.post("/auth/login", data);
  return response.data;
};

export const register = async (data: {
  shopName: string;
  ownerName: string;
  email: string;
  password: string;
}) => {
  const response = await api.post("/auth/register", data);
  return response.data;
};

export const getMe = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

export const logout = async () => {
  const response = await api.post("/auth/logout");
  return response.data;
};

export interface UpdateProfileRequest {
  name?: string;
  shopName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export const updateProfile = async (payload: UpdateProfileRequest) => {
  const response = await api.patch("/auth/profile", payload);

  return response.data;
};
