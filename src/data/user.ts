import bcrypt from "bcryptjs"
import { db } from "@/lib/db"

export type UserCreate = {
  email: string
  password: string
  bedriftId?: string // Legg til bedriftId her hvis nødvendig
  navn: string
  etternavn: string
  position: string
  role: string
  // Fjern felter som ikke tilhører User-modellen
}

export async function createUser(data: UserCreate) {
  const hashedPassword = await bcrypt.hash(data.password, 10)
  
  try {
    const user = await db.user.create({
      data: {
        ...data,
        password: hashedPassword
      }
    })
    return { success: true, user }
  } catch (error) {
    console.error("Feil ved oppretting av bruker:", error)
    return { success: false, error: "Kunne ikke opprette bruker" }
  }
}

export const getUserByEmail = async (email: string) => {
  console.log("Getting user by email:", email)
  try {
    const user = await db.user.findUnique({ 
      where: { email } 
    })
    console.log("User found:", !!user)
    return user
  } catch (error) {
    console.error("Error getting user by email:", error)
    throw error
  }
}

export async function updateUser(id: string, data: Partial<UserCreate>) {
  try {
    const user = await db.user.update({
      where: { id },
      data
    })
    return { success: true, user }
  } catch (error) {
    console.error("Feil ved oppdatering av bruker:", error)
    return { success: false, error: "Kunne ikke oppdatere bruker" }
  }
}

export async function deleteUser(id: string) {
  try {
    await db.user.delete({
      where: { id }
    })
    return { success: true }
  } catch (error) {
    console.error("Feil ved sletting av bruker:", error)
    return { success: false, error: "Kunne ikke slette bruker" }
  }
}

export const getUserById = async (id: string) => {
  console.log("Getting user by id:", id)
  try {
    const user = await db.user.findUnique({ 
      where: { id } 
    })
    console.log("User found:", !!user)
    return user
  } catch (error) {
    console.error("Error getting user by id:", error)
    throw error
  }
}

// Legg til denne funksjonen for å hente alle brukere
export const getUsers = async (bedriftId: string) => {
  try {
    const users = await db.user.findMany({
      where: { bedriftId },
      select: {
        id: true,
        navn: true,
        etternavn: true,
        position: true,
      },
    })
    return users
  } catch (error) {
    console.error("Feil ved henting av brukere:", error)
    return []
  }
}