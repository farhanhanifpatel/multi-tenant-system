// import jwt from "jsonwebtoken";
// import { Response } from "express";

// export interface CustomJwtPayload {
//   userId: string;
//   shopId: string;
// }

// export const generateToken = (
//   userId: string,
//   shopId: string,
//   res: Response,
// ): string => {
//   if (!process.env.JWT_SECRET) {
//     throw new Error("JWT_SECRET is not defined");
//   }

//   const payload: CustomJwtPayload = {
//     userId,
//     shopId,
//   };

//   const token = jwt.sign(payload, process.env.JWT_SECRET, {
//     expiresIn: "7d",
//   });

//   res.cookie("jwt", token, {
//     maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     sameSite: "lax",
//   });

//   return token;
// };

import jwt from "jsonwebtoken";

export interface CustomJwtPayload {
  userId: string;
  shopId: string;
}

export const generateToken = (userId: string, shopId: string): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }

  const payload: CustomJwtPayload = {
    userId,
    shopId,
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};
