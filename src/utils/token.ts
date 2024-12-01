import { db } from "@/lib/db";
import crypto from 'crypto';

export const generateVerificationToken = async (identifier: string) => {
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // Gyldig i 24 timer

  await db.verificationToken.create({
    data: {
      identifier,
      token,
      expires,
    },
  });

  return token;
};