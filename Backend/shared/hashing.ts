import bcrypt from "bcryptjs";
import crypto from "crypto";
export async function createHash(str: string): Promise<string> {
  return bcrypt.hash(str, 10);
}

export async function compareHash(str: string, hash: string): Promise<boolean> {
  return bcrypt.compare(str, hash);
}
