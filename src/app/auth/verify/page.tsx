import { db } from '@/lib/db'

export default async function VerifyPage({ params }) {
  const { token, email } = params

  const verificationToken = await db.verificationToken.findUnique({
    where: {
      identifier_token: {
        identifier: email,
        token: token,
      }
    }
  })

  if (!verificationToken) {
    // Håndter ugyldig token
  }

  // Fortsett med verifisering
} 