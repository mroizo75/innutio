import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-utils"

export async function GET() {
  const currentUser = await getCurrentUser()
  
  if (!currentUser || currentUser.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const data = await db.user.findUnique({
    where: { id: currentUser.id },
    include: {
      bedrift: {
        include: {
          users: true,
          prosjekter: {
            include: {
              oppgaver: true,
              timeEntries: true
            }
          }
        }
      }
    }
  })

  return NextResponse.json(data)
}