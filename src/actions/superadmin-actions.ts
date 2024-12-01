"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"
import { generatePasswordResetToken } from "@/lib/tokens"
import { sendPasswordResetEmail } from "@/lib/mail"
import { getUserByEmail } from "@/data/user"
import { UserRole, BedriftStatus } from "@prisma/client"

export async function opprettBedrift(data: {
  navn: string
  orgnr: string
  status: string
  postnr: string
  sted: string
  abonnementType: string
  abonnementStart: string
  abonnementSlutt?: string
}) {
  await db.bedrift.create({
    data: {
      navn: data.navn,
      orgnr: data.orgnr,
      postnr: data.postnr,
      sted: data.sted,
      status: data.status as BedriftStatus,
      abonnementType: data.abonnementType,
      abonnementStart: new Date(data.abonnementStart),
      abonnementSlutt: data.abonnementSlutt ? new Date(data.abonnementSlutt) : null,
    }
  })

  revalidatePath("/superadmin")
}

export async function oppdaterBedriftStatus(
  bedriftId: string,
  status: string,
  abonnementSlutt?: Date
) {
  await db.bedrift.update({
    where: { id: bedriftId },
    data: { 
      status: status as BedriftStatus,
      abonnementSlutt: abonnementSlutt || null
    }
  })

  revalidatePath("/superadmin")
}

export async function oppdaterBruker(
  brukerId: string,
  data: {
    navn: string
    email: string
    role: string
    active: boolean
    stilling?: string
  }
) {
  await db.user.update({
    where: { id: brukerId },
    data: {
      ...data,
      role: data.role as UserRole
    }
  })

  revalidatePath("/superadmin")
}

export async function oppdaterStoffkartotek(
  id: string,
  data: {
    produktnavn: string
    beskrivelse: string
    faremerking: string
    bruksomrade: string
    forholdsregler: string
  }
) {
  await db.stoffkartotek.create({
    data: {
      ...data,
      bedriftId: id
    }
  })

  revalidatePath("/superadmin")
}

export async function loggSupportHendelse(
  bedriftId: string,
  beskrivelse: string,
  type: string
) {
  await db.supportLogg.create({
    data: {
      bedriftId,
      beskrivelse,
      type,
      opprettetAv: "SUPPORT"
    }
  })

  revalidatePath("/superadmin")
}

export async function slettBedrift(id: string) {
  await db.bedrift.delete({
    where: { id }
  })
  
  revalidatePath("/superadmin")
}

export async function opprettBruker(data: {
  navn: string
  email: string
  role: string
  bedriftId: string
  stilling?: string
}) {
  await db.user.create({
    data: {
      ...data,
      active: true,
      role: data.role as UserRole,
      password: "",
      etternavn: ""
    }
  })

  revalidatePath("/superadmin")
}

export async function slettBruker(brukerId: string) {
  const response = await db.user.delete({
    where: { id: brukerId }
  })
  revalidatePath('/superadmin/brukere')
  return response
}

export async function slettStoffkartotek(stoffId: string) {
  await db.stoffkartotek.delete({
    where: { id: stoffId }
  })

  revalidatePath("/superadmin")
}

export async function registrerSuperAdmin(data: {
  email: string
  navn: string
  etternavn: string
  password: string
}) {
  const hashedPassord = await bcrypt.hash(data.password, 10)
  
  await db.superAdmin.create({
    data: {
      email: data.email,
      navn: data.navn,
      etternavn: data.etternavn,
      password: hashedPassord,
      role: "SUPERADMIN"
    }
  })
  
  revalidatePath("/superadmin")
}

export async function opprettBrukerMedVerifisering(data: {
  email: string
  navn: string
  etternavn: string
  stilling: string
  role: string
  bedriftId: string
}) {
  try {
    const existingUser = await getUserByEmail(data.email)
    if (existingUser) {
      return { success: false, error: "En bruker med denne e-postadressen eksisterer allerede" }
    }

    const bruker = await db.user.create({
      data: {
        email: data.email,
        navn: data.navn,
        etternavn: data.etternavn,
        position: data.stilling,
        role: data.role as UserRole,
        bedriftId: data.bedriftId,
        password: "",
        active: false,
        emailVerified: null
      }
    })

    const verificationToken = await generatePasswordResetToken(data.email)
    await sendPasswordResetEmail(
      data.email,
      verificationToken.token,
      "Registrer din brukerkonto"
    )

    revalidatePath("/superadmin")
    return { success: true }
  } catch (error) {
    console.error("Feil ved oppretting av bruker:", error)
    return { success: false, error: "Kunne ikke opprette bruker" }
  }
}