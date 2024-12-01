import { db } from '../db'
import { UserRole } from '@prisma/client'

interface SendNotificationOptions {
  message: string
  url: string
  bedriftId: string
  roller?: UserRole[]
  brukere?: string[]
}

export async function sendNotification({
  message,
  url,
  bedriftId,
  roller = [UserRole.ADMIN, UserRole.LEDER, UserRole.PROSJEKTLEDER],
  brukere = []
}: SendNotificationOptions) {
  const whereCondition = {
    bedriftId,
    ...(brukere.length > 0
      ? { OR: [{ role: { in: roller } }, { id: { in: brukere } }] }
      : { role: { in: roller } })
  }

  const mottakere = await db.user.findMany({
    where: whereCondition
  })

  for (const mottaker of mottakere) {
    await db.notification.create({
      data: {
        message,
        url,
        userId: mottaker.id,
      },
    })

    if (global.io) {
      global.io.to(mottaker.id).emit('nyNotifikasjon', {
        message,
        url,
      })
    }
  }
}
