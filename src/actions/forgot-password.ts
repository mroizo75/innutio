"use server"

import { db } from "@/lib/db"
import { generatePasswordResetToken } from "@/lib/tokens"
import { sendPasswordResetEmail } from "@/lib/mail"
import { getUserByEmail } from "@/data/user"

export const forgotPassword = async (email: string) => {
  try {
    const existingUser = await getUserByEmail(email)

    if (!existingUser) {
      return { error: "Ingen bruker funnet med denne e-postadressen" }
    }

    // Generer reset token
    const passwordResetToken = await generatePasswordResetToken(email)

    // Send e-post med reset-lenke
    await sendPasswordResetEmail(
      passwordResetToken.email,
      passwordResetToken.token,
      "Tilbakestill passordet ditt"
    )

    return { success: "E-post med instruksjoner er sendt" }
  } catch (error) {
    console.error("Feil ved tilbakestilling av passord:", error)
    return { error: "Kunne ikke sende tilbakestillings-e-post" }
  }
} 