import { db } from '@/lib/db'

export async function verifyToken(email: string, token: string) {
  const verificationToken = await db.verificationToken.findUnique({
    where: {
      identifier_token: {
        identifier: email,
        token: token,
      },
    },
  })

  if (!verificationToken) {
    throw new Error('Tokenet er ugyldig eller har utløpt.')
  }

  // Slett tokenet etter bruk
  await db.verificationToken.delete({
    where: {
      identifier_token: {
        identifier: email,
        token: token,
      },
    },
  })

  return true
} 