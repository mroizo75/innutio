"use server"

import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

export const resetPassword = async (token: string, password: string) => {
  if (!token) {
    return { error: "Token mangler" }
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // Først sjekk passwordResetToken
    const user = await db.user.findFirst({
      where: { 
        passwordResetToken: token
      }
    })

    if (!user) {
      // Hvis ikke funnet, sjekk initialSetupToken
      const userWithInitialToken = await db.initialSetupToken.findUnique({
        where: { token },
        include: { user: true }
      })

      if (!userWithInitialToken) {
        return { error: "Token er ugyldig" }
      }

      // Oppdater bruker med nytt passord
      await db.user.update({
        where: { id: userWithInitialToken.userId },
        data: { 
          password: hashedPassword,
          emailVerified: new Date()
        }
      })

      // Slett initialSetupToken
      await db.initialSetupToken.delete({
        where: { id: userWithInitialToken.id }
      })

      return { success: "Passord er satt opp" }
    }

    // Sjekk om token er utløpt for passwordResetToken
    if (user.passwordResetExpires && new Date() > user.passwordResetExpires) {
      return { error: "Token er utløpt" }
    }

    // Oppdater bruker med nytt passord
    await db.user.update({
      where: { id: user.id },
      data: { 
        password: hashedPassword,
        emailVerified: new Date(),
        passwordResetToken: null,
        passwordResetExpires: null
      }
    })

    return { success: "Passord er oppdatert" }
  } catch (error) {
    console.error("Feil ved oppdatering av passord:", error)
    return { error: "Noe gikk galt ved oppdatering av passord" }
  }
}