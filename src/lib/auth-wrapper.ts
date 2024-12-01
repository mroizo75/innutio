import { auth } from "@/lib/auth-utils"
import { cache } from 'react'
import { db } from "./db"

export const getAuthUser = cache(async () => {
  const session = await auth()
  
  if (!session?.user?.id) {
    return null
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      bedrift: true,
      oppgaver: {
        include: {
          prosjekt: true,
        }
      }
    }
  })

  return {
    session,
    user
  }
})