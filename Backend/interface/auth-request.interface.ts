import { Request } from "express";
import { AuthUser } from "../types/auth.types";

export interface AuthRequest extends Request {
  user?: AuthUser;
  file?: Express.Multer.File;
}
