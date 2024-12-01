"use server"

import { getAuthUser } from "@/lib/auth-wrapper"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function getProjectData() {
  const { user } = await getAuthUser() || {}
  if (!user) return null

  return await db.prosjekt.findMany({
    where: { 
      bedriftId: user.bedriftId 
    },
    include: {
      oppgaver: {
        include: {
          bruker: true,
          prosjekt: true
        }
      },
      timeEntries: true
    }
  })
}

export async function updateProject(data: any) {
  const { user } = await getAuthUser() || {}
  if (!user) return null
  
  // Prosjekt oppdatering logikk
  await db.prosjekt.update({
    where: { id: data.id },
    data: { ...data }
  })
  
  revalidatePath("/prosjekter")
}