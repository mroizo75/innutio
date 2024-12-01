"use server"

import { auth } from "@/lib/auth-utils"
import { db } from "@/lib/db"
import { generatePasswordResetToken } from "@/lib/tokens"
import { sendPasswordResetEmail } from "@/lib/mail"
import { createUser } from "@/data/user"
import { getUserByEmail } from "@/data/user"
import { UserRole } from "@prisma/client"

export async function addUserAction(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Ikke autentisert")
  }

  const adminUser = await db.user.findUnique({
    where: { id: session.user.id }
  })

  if (adminUser?.role !== "ADMIN") {
    throw new Error("Bare administratorer kan legge til nye brukere")
  }

  const navn = formData.get("navn") as string
  const etternavn = formData.get("etternavn") as string
  const email = formData.get("email") as string
  const position = formData.get("position") as string
  const role = formData.get("role") as UserRole

  try {
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return { error: "En bruker med denne e-postadressen eksisterer allerede" }
    }

    const user = await createUser({
      navn,
      etternavn,
      email,
      position,
      role: role || "USER",
      bedriftId: adminUser.bedriftId!,
      password: "",
    })

    if (!user.success) {
      throw new Error(user.error)
    }

    const passwordResetToken = await generatePasswordResetToken(email)
    await sendPasswordResetEmail(passwordResetToken.email, passwordResetToken.token)

    return { success: true }
  } catch {
    return { error: "Kunne ikke opprette bruker" }
  }
} 