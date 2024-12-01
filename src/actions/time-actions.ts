import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function addTimeEntry(data: {
  userId: string
  prosjektId: string
  date: Date
  hours: number
  description: string
}) {
  await db.timeEntry.create({
    data: {
      bruker: { connect: { id: data.userId } },
      prosjekt: { connect: { id: data.prosjektId } },
      date: data.date,
      hours: data.hours,
      description: data.description
    }
  })
  
  revalidatePath("/leder")
  revalidatePath("/admin")
}

export async function editTimeEntry(
  id: string,
  data: {
    date?: Date
    hours?: number
    description?: string
  }
) {
  await db.timeEntry.update({
    where: { id },
    data
  })
  
  revalidatePath("/leder")
  revalidatePath("/admin")
}

export async function deleteTimeEntry(id: string) {
  await db.timeEntry.delete({
    where: { id }
  })
  
  revalidatePath("/leder")
  revalidatePath("/admin")
}